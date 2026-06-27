import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceService } from "@/services/invoice.service";
import InvoiceDetail from "@/components/invoices/InvoiceDetail";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const service = new InvoiceService(supabase);

  let invoice;

  try {
    invoice = await service.getById(numericId);
  } catch {
    notFound();
  }

  return <InvoiceDetail invoice={invoice} />;
}
