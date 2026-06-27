import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingGroupService } from "@/services/bookingGroup.service";
import BookingGroupDetail from "@/components/booking-groups/BookingGroupDetail";

type BookingGroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingGroupDetailPage({
  params,
}: BookingGroupDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const service = new BookingGroupService(supabase);

  let group;

  try {
    group = await service.getById(numericId);
  } catch {
    notFound();
  }

  return <BookingGroupDetail group={group} />;
}
