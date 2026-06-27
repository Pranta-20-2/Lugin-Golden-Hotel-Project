import { createClient } from "@/lib/supabase/server";
import { CustomerService } from "@/services/customer.service";
import BookingForm from "@/components/bookings/BookingForm";

export default async function NewBookingPage() {
  const supabase = await createClient();
  const customerService = new CustomerService(supabase);
  const customers = await customerService.getAll();

  return <BookingForm customers={customers} />;
}
