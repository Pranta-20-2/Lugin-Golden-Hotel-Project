import type { SupabaseClient } from "@supabase/supabase-js";
import { BookingRepository } from "@/repositories/booking.repository";
import { BookingGroupRepository } from "@/repositories/bookingGroup.repository";
import { InvoiceRepository } from "@/repositories/invoice.repository";
import { BookingService } from "@/services/booking.service";
import { BookingGroupService } from "@/services/bookingGroup.service";
import { getBookingGroupTotals } from "@/types/bookingGroup";
import type { InvoiceWithRelations } from "@/types/invoice";
import { resolveInvoiceStatus } from "@/types/invoice";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "@/validators/invoice.schema";
import type { PaginationParams, PaginatedResult } from "@/types/pagination";
import { calculateDueAmount } from "@/lib/bookingCalculations";

export class InvoiceServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "InvoiceServiceError";
  }
}

function mapSupabaseError(error: { code?: string; message: string }): never {
  if (error.code === "23505") {
    throw new InvoiceServiceError("Invoice number already exists", 409);
  }
  if (error.code === "23503") {
    throw new InvoiceServiceError("Related booking or customer not found", 400);
  }
  if (error.code === "PGRST116") {
    throw new InvoiceServiceError("Invoice not found", 404);
  }
  throw new InvoiceServiceError(error.message, 500);
}

export class InvoiceService {
  private readonly repository: InvoiceRepository;
  private readonly bookingRepository: BookingRepository;
  private readonly bookingGroupRepository: BookingGroupRepository;
  private readonly bookingService: BookingService;
  private readonly bookingGroupService: BookingGroupService;

  constructor(supabase: SupabaseClient) {
    this.repository = new InvoiceRepository(supabase);
    this.bookingRepository = new BookingRepository(supabase);
    this.bookingGroupRepository = new BookingGroupRepository(supabase);
    this.bookingService = new BookingService(supabase);
    this.bookingGroupService = new BookingGroupService(supabase);
  }

  async getPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<InvoiceWithRelations>> {
    try {
      return await this.repository.findPaginated(params);
    } catch (error) {
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async getById(id: number): Promise<InvoiceWithRelations> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new InvoiceServiceError("Invalid invoice id", 400);
    }

    try {
      const invoice = await this.repository.findById(id);
      if (!invoice) {
        throw new InvoiceServiceError("Invoice not found", 404);
      }
      return invoice;
    } catch (error) {
      if (error instanceof InvoiceServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async update(id: number, input: unknown): Promise<InvoiceWithRelations> {
    const parsed = updateInvoiceSchema.safeParse(input);
    if (!parsed.success) {
      throw new InvoiceServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    try {
      const invoice = await this.getById(id);
      const totalBill = Number(invoice.total_bill);
      const amountPaid = parsed.data.amount_paid;

      if (amountPaid > totalBill) {
        throw new InvoiceServiceError(
          "Amount paid cannot exceed total bill",
          400
        );
      }

      const dueAmount = calculateDueAmount(totalBill, amountPaid);
      const updated = await this.repository.update(id, {
        total_bill: totalBill,
        amount_paid: amountPaid,
        due_amount: dueAmount,
        status: resolveInvoiceStatus(totalBill, amountPaid),
        notes:
          parsed.data.notes !== undefined
            ? parsed.data.notes
            : (invoice.notes ?? null),
      });

      await this.syncSourceBilling(updated, amountPaid, dueAmount);
      return updated;
    } catch (error) {
      if (error instanceof InvoiceServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async delete(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new InvoiceServiceError("Invalid invoice id", 400);
    }

    try {
      const invoice = await this.repository.findById(id);
      if (!invoice) {
        throw new InvoiceServiceError("Invoice not found", 404);
      }

      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof InvoiceServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  async create(input: unknown): Promise<InvoiceWithRelations> {
    const parsed = createInvoiceSchema.safeParse(input);
    if (!parsed.success) {
      throw new InvoiceServiceError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400
      );
    }

    try {
      if (parsed.data.booking_id) {
        return await this.createFromBooking(
          parsed.data.booking_id,
          parsed.data.notes,
          parsed.data.advance_paid
        );
      }
      return await this.createFromGroup(
        parsed.data.group_id!,
        parsed.data.notes,
        parsed.data.advance_paid
      );
    } catch (error) {
      if (error instanceof InvoiceServiceError) throw error;
      mapSupabaseError(error as { code?: string; message: string });
    }
  }

  private async createFromBooking(
    bookingId: number,
    notes?: string,
    advancePaidInput?: number
  ): Promise<InvoiceWithRelations> {
    const existing = await this.repository.findActiveByBookingId(bookingId);
    if (existing) {
      throw new InvoiceServiceError(
        "An active invoice already exists for this booking",
        409
      );
    }

    const booking = await this.bookingService.getById(bookingId);
    if (booking.group_id) {
      throw new InvoiceServiceError(
        "Generate invoice from the booking group instead",
        400
      );
    }

    const totalBill = Number(booking.total_bill);
    const amountPaid =
      advancePaidInput ?? Number(booking.advance_paid ?? 0);

    if (amountPaid > totalBill) {
      throw new InvoiceServiceError(
        "Advance payment cannot exceed total bill",
        400
      );
    }

    const dueAmount = calculateDueAmount(totalBill, amountPaid);
    if (dueAmount > 0) {
      throw new InvoiceServiceError(
        "Invoice can only be generated when due amount is 0",
        400
      );
    }

    const invoiceNo = await this.repository.getNextInvoiceNo();
    const invoice = await this.repository.create({
      invoice_no: invoiceNo,
      booking_id: booking.id,
      group_id: null,
      customer_id: booking.customer_id,
      total_bill: totalBill,
      amount_paid: amountPaid,
      due_amount: dueAmount,
      status: resolveInvoiceStatus(totalBill, amountPaid),
      notes: notes ?? null,
    });

    await this.syncSourceBilling(invoice, amountPaid, dueAmount);
    return invoice;
  }

  private async createFromGroup(
    groupId: number,
    notes?: string,
    advancePaidInput?: number
  ): Promise<InvoiceWithRelations> {
    const existing = await this.repository.findActiveByGroupId(groupId);
    if (existing) {
      throw new InvoiceServiceError(
        "An active invoice already exists for this group",
        409
      );
    }

    const group = await this.bookingGroupService.getById(groupId);
    const totals = getBookingGroupTotals(group);
    const amountPaid = advancePaidInput ?? totals.advancePaid;

    if (amountPaid > totals.totalBill) {
      throw new InvoiceServiceError(
        "Advance payment cannot exceed total bill",
        400
      );
    }

    const dueAmount = calculateDueAmount(totals.totalBill, amountPaid);
    if (dueAmount > 0) {
      throw new InvoiceServiceError(
        "Invoice can only be generated when due amount is 0",
        400
      );
    }

    const invoiceNo = await this.repository.getNextInvoiceNo();
    const invoice = await this.repository.create({
      invoice_no: invoiceNo,
      booking_id: null,
      group_id: group.id,
      customer_id: group.customer_id ?? null,
      total_bill: totals.totalBill,
      amount_paid: amountPaid,
      due_amount: dueAmount,
      status: resolveInvoiceStatus(totals.totalBill, amountPaid),
      notes: notes ?? null,
    });

    await this.syncSourceBilling(invoice, amountPaid, dueAmount);
    return invoice;
  }

  private async syncSourceBilling(
    invoice: InvoiceWithRelations,
    amountPaid: number,
    dueAmount: number
  ): Promise<void> {
    if (invoice.booking_id) {
      const booking = await this.bookingRepository.findById(invoice.booking_id);
      if (!booking) return;

      await this.bookingRepository.update(invoice.booking_id, {
        booking_no: booking.booking_no,
        customer_id: booking.customer_id,
        group_id: booking.group_id,
        room_type_id: booking.room_type_id,
        check_in: booking.check_in,
        check_out: booking.check_out,
        nights: booking.nights,
        rate_per_night: booking.rate_per_night,
        total_bill: booking.total_bill,
        advance_paid: amountPaid,
        due_amount: dueAmount,
        status: booking.status,
        notes: booking.notes ?? null,
      });
      return;
    }

    if (invoice.group_id) {
      const group = await this.bookingGroupRepository.findById(invoice.group_id);
      if (!group?.bookings?.length) return;

      const totalBill = getBookingGroupTotals(group).totalBill;
      const sorted = [...group.bookings].sort((a, b) => a.id - b.id);
      const [first, ...rest] = sorted;

      await this.bookingRepository.update(first.id, {
        booking_no: first.booking_no,
        customer_id: null,
        group_id: invoice.group_id,
        room_type_id: first.room_type_id,
        check_in: group.check_in,
        check_out: group.check_out,
        nights: first.nights,
        rate_per_night: first.rate_per_night,
        total_bill: first.total_bill,
        advance_paid: amountPaid,
        due_amount: calculateDueAmount(totalBill, amountPaid),
        status: first.status,
      });

      for (const child of rest) {
        await this.bookingRepository.update(child.id, {
          booking_no: child.booking_no,
          customer_id: null,
          group_id: invoice.group_id,
          room_type_id: child.room_type_id,
          check_in: group.check_in,
          check_out: group.check_out,
          nights: child.nights,
          rate_per_night: child.rate_per_night,
          total_bill: child.total_bill,
          advance_paid: 0,
          due_amount: child.total_bill,
          status: child.status,
        });
      }
    }
  }
}
