import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceService } from "@/services/invoice.service";
import { BookingService } from "@/services/booking.service";
import { BookingGroupService } from "@/services/bookingGroup.service";
import { InvoiceRepository } from "@/repositories/invoice.repository";
import InvoiceList from "@/components/invoices/InvoiceList";
import InvoiceGenerateCard from "@/components/invoices/InvoiceGenerateCard";
import { normalizePaginationParams } from "@/types/pagination";
import { getBookingGroupTotals } from "@/types/bookingGroup";

type InvoicesPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
    bookingId?: string;
    groupId?: string;
  }>;
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const pagination = normalizePaginationParams(
    params.page,
    params.pageSize,
    params.q
  );

  const supabase = await createClient();
  const invoiceService = new InvoiceService(supabase);
  const invoiceRepo = new InvoiceRepository(supabase);
  const result = await invoiceService.getPaginated(pagination);

  const bookingId = params.bookingId ? Number(params.bookingId) : null;
  const groupId = params.groupId ? Number(params.groupId) : null;

  let generateCard = null;

  if (bookingId && Number.isInteger(bookingId) && bookingId > 0) {
    const existing = await invoiceRepo.findActiveByBookingId(bookingId);
    if (existing) {
      redirect(`/invoices/${existing.id}`);
    }

    const bookingService = new BookingService(supabase);
    try {
      const booking = await bookingService.getById(bookingId);
      generateCard = (
        <InvoiceGenerateCard
          type="booking"
          sourceId={booking.id}
          title={booking.customers?.name ?? "Guest"}
          subtitle={`${booking.room_types?.name ?? "Room"} · ${booking.booking_no}`}
          nights={booking.nights}
          totalBill={Number(booking.total_bill)}
          advancePaid={Number(booking.advance_paid)}
          dueAmount={Number(booking.due_amount)}
        />
      );
    } catch {
      // ignore invalid booking id
    }
  }

  if (groupId && Number.isInteger(groupId) && groupId > 0) {
    const existing = await invoiceRepo.findActiveByGroupId(groupId);
    if (existing) {
      redirect(`/invoices/${existing.id}`);
    }

    const groupService = new BookingGroupService(supabase);
    try {
      const group = await groupService.getById(groupId);
      const totals = getBookingGroupTotals(group);
      generateCard = (
        <InvoiceGenerateCard
          type="group"
          sourceId={group.id}
          title={group.group_name}
          subtitle={group.contact_person}
          nights={totals.nights}
          totalBill={totals.totalBill}
          advancePaid={totals.advancePaid}
          dueAmount={totals.dueAmount}
          roomCount={totals.roomCount}
        />
      );
    } catch {
      // ignore invalid group id
    }
  }

  return (
    <>
      {generateCard}
      <InvoiceList invoices={result.data} pagination={result} />
    </>
  );
}
