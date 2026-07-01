import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingGroupService } from "@/services/bookingGroup.service";
import { InvoiceService } from "@/services/invoice.service";
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
  const invoiceService = new InvoiceService(supabase);

  let group;
  let invoice = null;

  try {
    group = await service.getById(numericId);
    invoice = await invoiceService.getActiveByGroupId(numericId);
  } catch {
    notFound();
  }

  return <BookingGroupDetail group={group} invoice={invoice} />;
}
