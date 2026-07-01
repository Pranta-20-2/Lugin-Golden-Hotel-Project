import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/services/booking.service";
import { InvoiceService } from "@/services/invoice.service";
import BookingDetail from "@/components/bookings/BookingDetail";

type BookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const service = new BookingService(supabase);
  const invoiceService = new InvoiceService(supabase);

  let booking;
  let invoice = null;

  try {
    booking = await service.getById(numericId);
    invoice = await invoiceService.getActiveByBookingId(numericId);
  } catch {
    notFound();
  }

  return <BookingDetail booking={booking} invoice={invoice} />;
}
