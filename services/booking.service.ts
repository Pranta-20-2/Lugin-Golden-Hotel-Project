import type { SupabaseClient } from "@supabase/supabase-js";
import { BookingRepository } from "@/repositories/booking.repository";
import { RoomTypeRepository } from "@/repositories/roomType.repository";
import {
  CustomerService,
  CustomerServiceError,
} from "@/services/customer.service";
import type { BookingStatus, BookingWithRelations, CreateBookingInput } from "@/types/booking";
import { bookingSchema, type BookingFormSchema } from "@/validators/booking.schema";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import {
  calculateDueAmount,
  calculateNights,
  calculateTotalBill,
} from "@/lib/bookingCalculations";
import { isActiveBookingStatus } from "@/lib/bookingRoomStatusSync";

type BookingListParams = PaginationParams & {
  status?: BookingStatus;
};

export class BookingServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "BookingServiceError";
  }
}

function mapSupabaseError(error: { code?: string; message: string }): never {
  if (error.code === "23503") {
    throw new BookingServiceError(
      "Selected customer or room type does not exist",
      400
    );
  }

  if (error.code === "23505") {
    throw new BookingServiceError("Booking number already exists", 409);
  }

  if (error.code === "PGRST116") {
    throw new BookingServiceError("Booking not found", 404);
  }

  throw new BookingServiceError(error.message, 500);
}

export class BookingService {
  private readonly repository: BookingRepository;
  private readonly roomTypeRepository: RoomTypeRepository;
  private readonly customerService: CustomerService;

  constructor(supabase: SupabaseClient) {
    this.repository = new BookingRepository(supabase);
    this.roomTypeRepository = new RoomTypeRepository(supabase);
    this.customerService = new CustomerService(supabase);
  }

  private async resolveCustomerId(parsed: BookingFormSchema): Promise<number> {
    if (parsed.customer_mode === "existing") {
      return parsed.customer_id;
    }

    try {
      const customer = await this.customerService.create(parsed.customer);
      return customer.id;
    } catch (error) {
      if (error instanceof CustomerServiceError) {
        throw new BookingServiceError(error.message, error.status);
      }
      throw error;
    }
  }

  async getPaginated(
    params: BookingListParams
  ): Promise<PaginatedResult<BookingWithRelations>> {
    try {
      return await this.repository.findPaginated(params);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getById(id: number): Promise<BookingWithRelations> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BookingServiceError("Invalid booking id", 400);
    }

    try {
      const booking = await this.repository.findById(id);
      if (!booking) {
        throw new BookingServiceError("Booking not found", 404);
      }
      return booking;
    } catch (error) {
      if (error instanceof BookingServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  private async resolveRatePerNight(roomTypeId: number): Promise<number> {
    const roomType = await this.roomTypeRepository.findById(roomTypeId);
    return Number(roomType?.rate_per_night ?? 0);
  }

  private async buildBookingRecord(
    parsed: {
      customer_id: number;
      room_type_id: number;
      check_in: string;
      check_out: string;
      advance_paid?: number;
      status: BookingStatus;
      notes?: string;
    },
    bookingNo: string,
    groupId?: number | null
  ): Promise<CreateBookingInput> {
    const nights = calculateNights(parsed.check_in, parsed.check_out);
    const ratePerNight = await this.resolveRatePerNight(parsed.room_type_id);
    const totalBill = calculateTotalBill(nights, ratePerNight);
    const advancePaid = parsed.advance_paid ?? 0;

    if (advancePaid > totalBill) {
      throw new BookingServiceError(
        "Advance paid cannot exceed total bill",
        400
      );
    }

    return {
      booking_no: bookingNo,
      customer_id: parsed.customer_id,
      group_id: groupId ?? null,
      room_type_id: parsed.room_type_id,
      check_in: parsed.check_in,
      check_out: parsed.check_out,
      nights,
      rate_per_night: ratePerNight,
      total_bill: totalBill,
      advance_paid: advancePaid,
      due_amount: calculateDueAmount(totalBill, advancePaid),
      status: parsed.status,
      notes: parsed.notes ?? null,
    };
  }

  private async assertRoomTypeAvailable(
    roomTypeId: number,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: number,
    excludeGroupId?: number
  ): Promise<void> {
    const roomType = await this.roomTypeRepository.findById(roomTypeId);
    if (!roomType) {
      throw new BookingServiceError("Selected room type does not exist", 400);
    }

    const bookedCount = await this.repository.countOverlappingByRoomTypeId(
      roomTypeId,
      checkIn,
      checkOut,
      { excludeBookingId, excludeGroupId }
    );

    if (bookedCount + 1 > roomType.total_rooms) {
      throw new BookingServiceError(
        `No ${roomType.name} rooms available for the selected dates`,
        409
      );
    }
  }

  async create(input: unknown): Promise<BookingWithRelations> {
    const parsed = bookingSchema.safeParse(input);
    if (!parsed.success) {
      throw new BookingServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    if (isActiveBookingStatus(parsed.data.status)) {
      await this.assertRoomTypeAvailable(
        parsed.data.room_type_id,
        parsed.data.check_in,
        parsed.data.check_out
      );
    }

    try {
      const bookingNo = await this.repository.getNextBookingNo();
      const customerId = await this.resolveCustomerId(parsed.data);
      const record = await this.buildBookingRecord(
        { ...parsed.data, customer_id: customerId },
        bookingNo
      );
      return await this.repository.create(record);
    } catch (error) {
      if (error instanceof BookingServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async update(id: number, input: unknown): Promise<BookingWithRelations> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BookingServiceError("Invalid booking id", 400);
    }

    const parsed = bookingSchema.safeParse(input);
    if (!parsed.success) {
      throw new BookingServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    if (isActiveBookingStatus(parsed.data.status)) {
      await this.assertRoomTypeAvailable(
        parsed.data.room_type_id,
        parsed.data.check_in,
        parsed.data.check_out,
        id
      );
    }

    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new BookingServiceError("Booking not found", 404);
      }

      if (existing.group_id) {
        throw new BookingServiceError(
          "Edit group bookings from the Booking Groups page",
          400
        );
      }

      const customerId = await this.resolveCustomerId(parsed.data);
      const record = await this.buildBookingRecord(
        { ...parsed.data, customer_id: customerId },
        existing.booking_no,
        existing.group_id
      );
      return await this.repository.update(id, record);
    } catch (error) {
      if (error instanceof BookingServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async delete(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BookingServiceError("Invalid booking id", 400);
    }

    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new BookingServiceError("Booking not found", 404);
      }

      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof BookingServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }
}
