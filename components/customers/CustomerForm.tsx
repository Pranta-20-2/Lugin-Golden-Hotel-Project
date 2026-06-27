"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import CustomerFields from "@/components/customers/CustomerFields";
import type { Customer } from "@/types/customer";
import {
  customerToFieldValues,
  emptyCustomerFields,
} from "@/lib/customerFields";
import { customerSchema } from "@/validators/customer.schema";

type CustomerFormProps = {
  customer?: Customer;
  redirectTo?: string;
};

export default function CustomerForm({
  customer,
  redirectTo = "/customers",
}: CustomerFormProps) {
  const router = useRouter();
  const isEditing = Boolean(customer);
  const [values, setValues] = useState(() =>
    customer ? customerToFieldValues(customer) : emptyCustomerFields()
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goBack() {
    router.push(redirectTo);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = customerSchema.safeParse(values);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    const url = isEditing
      ? `/api/customers/${customer!.id}`
      : "/api/customers";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.error ?? "Something went wrong";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    toast.success(
      isEditing
        ? "Customer updated successfully"
        : "Customer created successfully"
    );
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
        {isEditing ? "Edit Customer" : "Add Customer"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CustomerFields values={values} onChange={setValues} />

        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={goBack}
            className="h-11 rounded-xl bg-slate-100 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}
