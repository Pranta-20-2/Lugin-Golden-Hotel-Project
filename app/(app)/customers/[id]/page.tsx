import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerService } from "@/services/customer.service";
import CustomerDetail from "@/components/customers/CustomerDetail";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const supabase = await createClient();
  const service = new CustomerService(supabase);

  let customer;

  try {
    customer = await service.getById(numericId);
  } catch {
    notFound();
  }

  return <CustomerDetail customer={customer} />;
}
