import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingGroupService } from "@/services/bookingGroup.service";
import BookingGroupForm from "@/components/booking-groups/BookingGroupForm";

type EditBookingGroupPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBookingGroupPage({
  params,
}: EditBookingGroupPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const groupService = new BookingGroupService(supabase);

  let group;

  try {
    group = await groupService.getById(numericId);
  } catch {
    notFound();
  }

  return (
    <BookingGroupForm
      group={group}
      redirectTo={`/booking-groups/${group.id}`}
    />
  );
}
