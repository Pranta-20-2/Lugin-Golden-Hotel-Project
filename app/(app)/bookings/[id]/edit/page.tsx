import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/services/booking.service";
import { CustomerService } from "@/services/customer.service";
import BookingForm from "@/components/bookings/BookingForm";

type EditBookingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBookingPage({
  params,
}: EditBookingPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const bookingService = new BookingService(supabase);
  const customerService = new CustomerService(supabase);

  let booking;

  try {
    booking = await bookingService.getById(numericId);
  } catch {
    notFound();
  }

  const customers = await customerService.getAll();

  return (
    <BookingForm
      booking={booking}
      customers={customers}
      redirectTo={`/bookings/${booking.id}`}
    />
  );
}
