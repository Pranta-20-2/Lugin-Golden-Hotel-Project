import { createClient } from "@/lib/supabase/server";
import { CustomerService } from "@/services/customer.service";
import CustomerList from "@/components/customers/CustomerList";
import { normalizePaginationParams } from "@/types/pagination";

type CustomersPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    q?: string;
  }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const pagination = normalizePaginationParams(
    params.page,
    params.pageSize,
    params.q
  );
  const supabase = await createClient();
  const service = new CustomerService(supabase);
  const result = await service.getPaginated(pagination);

  return (
    <CustomerList customers={result.data} pagination={result} />
  );
}
