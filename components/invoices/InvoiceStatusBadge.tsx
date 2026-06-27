import type { InvoiceStatus } from "@/types/invoice";
import { INVOICE_STATUS_LABELS } from "@/types/invoice";

const statusStyles: Record<InvoiceStatus, string> = {
  issued: "bg-blue-50 text-blue-700 ring-blue-100",
  partial: "bg-amber-50 text-amber-700 ring-amber-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

type InvoiceStatusBadgeProps = {
  status: InvoiceStatus;
};

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}
    >
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}
