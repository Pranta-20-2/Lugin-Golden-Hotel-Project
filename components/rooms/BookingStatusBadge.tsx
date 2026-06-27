import type { BookingStatus } from "@/types/booking";
import { BOOKING_STATUS_LABELS } from "@/types/booking";

const statusClasses: Record<BookingStatus, string> = {
  confirmed: "bg-blue-50 text-blue-700 ring-blue-100",
  checked_in: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  checked_out: "bg-slate-100 text-slate-600 ring-slate-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

export default function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[status]}`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
