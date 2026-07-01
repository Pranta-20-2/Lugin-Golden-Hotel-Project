import type { SupabaseClient } from "@supabase/supabase-js";
import { BookingRepository } from "@/repositories/booking.repository";
import { BookingGroupRepository } from "@/repositories/bookingGroup.repository";
import { RoomTypeRepository } from "@/repositories/roomType.repository";
import {
  CustomerService,
  CustomerServiceError,
} from "@/services/customer.service";
import type { BookingStatus, CreateBookingInput } from "@/types/booking";
import type { BookingGroupWithRelations } from "@/types/bookingGroup";
import {
  bookingGroupSchema,
  flattenRoomTypeLines,
  toBookingGroupFormRecord,
} from "@/validators/bookingGroup.schema";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import {
  calculateDueAmount,
  calculateNights,
  calculateTotalBill,
} from "@/lib/bookingCalculations";
import { isActiveBookingStatus } from "@/lib/bookingRoomStatusSync";
import { aggregateRoomTypeLines } from "@/lib/roomTypeAvailability";

type BookingGroupListParams = PaginationParams & {
  status?: BookingStatus;
};

export class BookingGroupServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "BookingGroupServiceError";
  }
}

function mapSupabaseError(error: { code?: string; message: string }): never {
  if (error.code === "23503") {
    throw new BookingGroupServiceError(
      "Selected room type does not exist",
      400
    );
  }

  if (error.code === "23505") {
    throw new BookingGroupServiceError(
      "Failed to assign unique booking numbers. Please try again.",
      409
    );
  }

  if (error.code === "PGRST116") {
    throw new BookingGroupServiceError("Booking group not found", 404);
  }

  throw new BookingGroupServiceError(error.message, 500);
}

export class BookingGroupService {
  private readonly repository: BookingGroupRepository;
  private readonly bookingRepository: BookingRepository;
  private readonly roomTypeRepository: RoomTypeRepository;
  private readonly customerService: CustomerService;

  constructor(supabase: SupabaseClient) {
    this.repository = new BookingGroupRepository(supabase);
    this.bookingRepository = new BookingRepository(supabase);
    this.roomTypeRepository = new RoomTypeRepository(supabase);
    this.customerService = new CustomerService(supabase);
  }

  private async resolveCustomerId(
    customer: ReturnType<typeof toBookingGroupFormRecord>["customer"],
    existingCustomerId?: number | null
  ): Promise<number> {
    try {
      if (existingCustomerId) {
        const updated = await this.customerService.update(
          existingCustomerId,
          customer
        );
        return updated.id;
      }

      const created = await this.customerService.create(customer);
      return created.id;
    } catch (error) {
      if (error instanceof CustomerServiceError) {
        throw new BookingGroupServiceError(error.message, error.status);
      }
      throw error;
    }
  }

  async getPaginated(
    params: BookingGroupListParams
  ): Promise<PaginatedResult<BookingGroupWithRelations>> {
    try {
      return await this.repository.findPaginated(params);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getById(id: number): Promise<BookingGroupWithRelations> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BookingGroupServiceError("Invalid booking group id", 400);
    }

    try {
      const group = await this.repository.findById(id);
      if (!group) {
        throw new BookingGroupServiceError("Booking group not found", 404);
      }
      return group;
    } catch (error) {
      if (error instanceof BookingGroupServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  private async assertRoomTypesAvailable(
    lines: Array<{ room_type_id: number; quantity: number }>,
    checkIn: string,
    checkOut: string,
    status: BookingStatus,
    excludeGroupId?: number
  ): Promise<void> {
    if (!isActiveBookingStatus(status)) return;

    const totals = aggregateRoomTypeLines(lines);

    for (const [roomTypeId, requestedCount] of totals.entries()) {
      const roomType = await this.roomTypeRepository.findById(roomTypeId);
      if (!roomType) {
        throw new BookingGroupServiceError(
          "Selected room type does not exist",
          400
        );
      }

      const bookedCount =
        await this.bookingRepository.countOverlappingByRoomTypeId(
          roomTypeId,
          checkIn,
          checkOut,
          { excludeGroupId }
        );

      if (bookedCount + requestedCount > roomType.total_rooms) {
        throw new BookingGroupServiceError(
          `Not enough ${roomType.name} rooms available for the selected dates`,
          409
        );
      }
    }
  }

  private async buildChildBookings(
    groupId: number,
    record: ReturnType<typeof toBookingGroupFormRecord>
  ): Promise<CreateBookingInput[]> {
    const nights = calculateNights(record.check_in, record.check_out);
    const roomTypeIds = flattenRoomTypeLines(record.room_type_lines);
    const lineTotals: {
      roomTypeId: number;
      totalBill: number;
      rate: number;
    }[] = [];

    for (const roomTypeId of roomTypeIds) {
      const roomType = await this.roomTypeRepository.findById(roomTypeId);
      if (!roomType) {
        throw new BookingGroupServiceError(
          "Selected room type does not exist",
          400
        );
      }

      const rate = Number(roomType.rate_per_night ?? 0);
      lineTotals.push({
        roomTypeId,
        rate,
        totalBill: calculateTotalBill(nights, rate),
      });
    }

    const groupTotal = lineTotals.reduce((sum, line) => sum + line.totalBill, 0);
    if (record.advance_paid > groupTotal) {
      throw new BookingGroupServiceError(
        "Advance paid cannot exceed total bill",
        400
      );
    }

    const bookings: CreateBookingInput[] = [];
    const bookingNos = await this.bookingRepository.getNextBookingNos(
      lineTotals.length
    );

    for (let index = 0; index < lineTotals.length; index++) {
      const line = lineTotals[index];
      const advancePaid = index === 0 ? record.advance_paid : 0;
      const dueAmount =
        index === 0
          ? calculateDueAmount(groupTotal, record.advance_paid)
          : line.totalBill;

      bookings.push({
        booking_no: bookingNos[index],
        customer_id: null,
        group_id: groupId,
        room_type_id: line.roomTypeId,
        check_in: record.check_in,
        check_out: record.check_out,
        nights,
        rate_per_night: line.rate,
        total_bill: line.totalBill,
        advance_paid: advancePaid,
        due_amount: dueAmount,
        status: record.status,
        notes: record.notes ?? null,
      });
    }

    return bookings;
  }

  async create(input: unknown): Promise<BookingGroupWithRelations> {
    const parsed = bookingGroupSchema.safeParse(input);
    if (!parsed.success) {
      throw new BookingGroupServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const record = toBookingGroupFormRecord(parsed.data);
    await this.assertRoomTypesAvailable(
      record.room_type_lines,
      record.check_in,
      record.check_out,
      record.status
    );

    try {
      const customerId = await this.resolveCustomerId(record.customer);
      const group = await this.repository.create({
        group_name: record.group_name,
        customer_id: customerId,
        contact_person: record.contact_person,
        mobile: record.mobile,
        check_in: record.check_in,
        check_out: record.check_out,
        status: record.status,
        notes: record.notes ?? null,
      });

      const childBookings = await this.buildChildBookings(group.id, record);
      await this.bookingRepository.createMany(childBookings);

      const created = await this.repository.findById(group.id);
      if (!created) {
        throw new BookingGroupServiceError("Failed to load created group", 500);
      }

      return created;
    } catch (error) {
      if (error instanceof BookingGroupServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async update(id: number, input: unknown): Promise<BookingGroupWithRelations> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BookingGroupServiceError("Invalid booking group id", 400);
    }

    const parsed = bookingGroupSchema.safeParse(input);
    if (!parsed.success) {
      throw new BookingGroupServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    const record = toBookingGroupFormRecord(parsed.data);
    await this.assertRoomTypesAvailable(
      record.room_type_lines,
      record.check_in,
      record.check_out,
      record.status,
      id
    );

    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new BookingGroupServiceError("Booking group not found", 404);
      }

      const customerId = await this.resolveCustomerId(
        record.customer,
        existing.customer_id
      );

      await this.repository.update(id, {
        group_name: record.group_name,
        customer_id: customerId,
        contact_person: record.contact_person,
        mobile: record.mobile,
        check_in: record.check_in,
        check_out: record.check_out,
        status: record.status,
        notes: record.notes ?? null,
      });

      await this.bookingRepository.deleteByGroupId(id);
      const childBookings = await this.buildChildBookings(id, record);
      await this.bookingRepository.createMany(childBookings);

      const updated = await this.repository.findById(id);
      if (!updated) {
        throw new BookingGroupServiceError("Failed to load updated group", 500);
      }

      return updated;
    } catch (error) {
      if (error instanceof BookingGroupServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async delete(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BookingGroupServiceError("Invalid booking group id", 400);
    }

    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new BookingGroupServiceError("Booking group not found", 404);
      }

      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof BookingGroupServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }
}
