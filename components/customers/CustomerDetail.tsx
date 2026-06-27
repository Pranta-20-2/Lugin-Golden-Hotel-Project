import type { Customer } from "@/types/customer";
import DeleteCustomerButton from "@/components/customers/DeleteCustomerButton";
import DetailView, { formatDate } from "@/components/ui/DetailView";

type CustomerDetailProps = {
  customer: Customer;
};

export default function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <DetailView
      title={customer.name}
      subtitle="Customer details"
      editHref={`/customers/${customer.id}/edit`}
      deleteSlot={
        <DeleteCustomerButton id={customer.id} name={customer.name} />
      }
      fields={[
        { label: "Name", value: customer.name },
        { label: "Mobile", value: customer.mobile },
        { label: "Email", value: customer.email || "—" },
        { label: "National ID", value: customer.national_id || "—" },
        { label: "Address", value: customer.address || "—" },
        { label: "Created", value: formatDate(customer.created_at) },
        { label: "Updated", value: formatDate(customer.updated_at) },
      ]}
    />
  );
}
