import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerService } from "@/services/customer.service";
import CustomerForm from "@/components/customers/CustomerForm";

type EditCustomerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
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

  return <CustomerForm customer={customer} />;
}
