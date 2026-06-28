"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { InvoiceWithRelations } from "@/types/invoice";
import { getInvoiceGuest } from "@/types/invoice";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import DeleteInvoiceButton from "@/components/invoices/DeleteInvoiceButton";
import Card from "@/components/ui/Card";
import ViewButton from "@/components/ui/ViewButton";
import Pagination from "@/components/ui/Pagination";
import DebouncedSearchInput from "@/components/ui/DebouncedSearchInput";
import { formatAmount } from "@/lib/formatCurrency";
import { formatDate } from "@/components/ui/DetailView";
import type { PaginatedResult } from "@/types/pagination";

type InvoiceListProps = {
  invoices: InvoiceWithRelations[];
  pagination: PaginatedResult<InvoiceWithRelations>;
};

function getSourceLabel(invoice: InvoiceWithRelations) {
  if (invoice.booking_groups) {
    return `Group · ${invoice.booking_groups.group_name}`;
  }
  if (invoice.bookings) {
    return `Booking · ${invoice.bookings.room_types?.name ?? "Room"}`;
  }
  return "—";
}

export default function InvoiceList({
  invoices,
  pagination,
}: InvoiceListProps) {
  const router = useRouter();
  const paginationQuery = { q: pagination.search };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {invoices.length} invoice{invoices.length === 1 ? "" : "s"}
        </p>
      </div>

      <DebouncedSearchInput
        placeholder="Search invoice no or notes..."
        className="max-w-md"
      />

      <Card padding="sm" className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoice No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Guest
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Issued
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Due
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    No invoices yet. Generate one from a booking or group booking.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                    className="cursor-pointer hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                      {invoice.invoice_no}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {getInvoiceGuest(invoice)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {getSourceLabel(invoice)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {formatDate(invoice.issued_at)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-emerald-600">
                      {formatAmount(Number(invoice.total_bill))}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium">
                      {Number(invoice.due_amount) > 0 ? (
                        <span className="text-amber-600">
                          {formatAmount(Number(invoice.due_amount))}
                        </span>
                      ) : (
                        <span className="text-emerald-600">
                          {formatAmount(0)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <ViewButton href={`/invoices/${invoice.id}`} />
                        <Link
                          href={`/invoices/${invoice.id}/edit`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary transition hover:bg-blue-100"
                        >
                          Edit
                        </Link>
                        <DeleteInvoiceButton
                          id={invoice.id}
                          invoiceNo={invoice.invoice_no}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} basePath="/invoices" query={paginationQuery} />
      </Card>

      <div className="space-y-3 md:hidden">
        {invoices.map((invoice) => (
          <Card
            key={invoice.id}
            padding="sm"
            className="cursor-pointer"
            onClick={() => router.push(`/invoices/${invoice.id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{invoice.invoice_no}</h3>
                <p className="mt-1 text-sm text-slate-600">{getInvoiceGuest(invoice)}</p>
                <p className="mt-1 text-xs text-slate-500">{getSourceLabel(invoice)}</p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="mt-3 text-sm">
              Due:{" "}
              <span className="font-semibold text-amber-600">
                {formatAmount(Number(invoice.due_amount))}
              </span>
            </p>
            <div
              className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <ViewButton href={`/invoices/${invoice.id}`} className="h-10 flex-1" />
              <Link
                href={`/invoices/${invoice.id}/edit`}
                className="flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-primary"
              >
                Edit
              </Link>
              <div className="w-full">
                <DeleteInvoiceButton
                  id={invoice.id}
                  invoiceNo={invoice.invoice_no}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}