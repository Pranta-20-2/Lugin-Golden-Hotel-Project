"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Customer } from "@/types/customer";
import DeleteCustomerButton from "@/components/customers/DeleteCustomerButton";
import Card from "@/components/ui/Card";
import AddButton from "@/components/ui/AddButton";
import ViewButton from "@/components/ui/ViewButton";
import Pagination from "@/components/ui/Pagination";
import DebouncedSearchInput from "@/components/ui/DebouncedSearchInput";
import type { PaginatedResult } from "@/types/pagination";

type CustomerListProps = {
  customers: Customer[];
  pagination: PaginatedResult<Customer>;
};

export default function CustomerList({
  customers,
  pagination,
}: CustomerListProps) {
  const router = useRouter();
  const paginationQuery = { q: pagination.search };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center gap-3 sm:gap-4">
        <div className="order-1 md:order-2 justify-self-end">
        <AddButton href="/customers/new">Add Customer</AddButton>
        </div>

        <p className="order-2 md:order-1 text-sm text-slate-500">
          {customers.length} customer{customers.length === 1 ? "" : "s"} registered
        </p>
      </div>
      

      <DebouncedSearchInput
        placeholder="Search name, mobile, or email..."
        className="max-w-full"
      />

      <Card padding="sm" className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  National ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No customers yet. Tap &quot;Add Customer&quot; to create one.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => router.push(`/customers/${customer.id}`)}
                    className="cursor-pointer hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {customer.mobile}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-sm text-slate-500">
                      {customer.email || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {customer.national_id || "—"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-sm text-slate-500">
                      {customer.address || "—"}
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <ViewButton href={`/customers/${customer.id}`} />
                        <Link
                          href={`/customers/${customer.id}/edit`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary transition hover:bg-blue-100"
                        >
                          Edit
                        </Link>
                        <DeleteCustomerButton
                          id={customer.id}
                          name={customer.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          {...pagination}
          basePath="/customers"
          query={paginationQuery}
        />
      </Card>

      <div className="space-y-3 md:hidden">
        {customers.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-slate-500">
              No customers yet. Tap &quot;Add Customer&quot; to create one.
            </p>
          </Card>
        ) : (
          customers.map((customer) => (
            <Card
              key={customer.id}
              padding="sm"
              className="cursor-pointer transition hover:ring-primary/30"
              onClick={() => router.push(`/customers/${customer.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-900">
                    {customer.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {customer.mobile}
                  </p>
                  {customer.email && (
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {customer.email}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-slate-500">
                    <span className="font-medium text-slate-600">National ID:</span>{" "}
                    {customer.national_id || "—"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    <span className="font-medium text-slate-600">Address:</span>{" "}
                    {customer.address || "—"}
                  </p>
                </div>
              </div>
              <div
                className="mt-4 flex gap-2 border-t border-slate-100 pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <ViewButton
                  href={`/customers/${customer.id}`}
                  className="h-10 flex-1"
                />
                <Link
                  href={`/customers/${customer.id}/edit`}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-primary"
                >
                  Edit
                </Link>
                <div className="flex-1">
                  <DeleteCustomerButton
                    id={customer.id}
                    name={customer.name}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <div className="md:hidden">
        <Card padding="sm">
          <Pagination
            {...pagination}
            basePath="/customers"
            query={paginationQuery}
          />
        </Card>
      </div>
    </div>
  );
}
