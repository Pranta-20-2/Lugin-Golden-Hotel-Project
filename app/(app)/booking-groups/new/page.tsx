import { createClient } from "@/lib/supabase/server";
import BookingGroupForm from "@/components/booking-groups/BookingGroupForm";

export default async function NewBookingGroupPage() {
  return <BookingGroupForm />;
}
