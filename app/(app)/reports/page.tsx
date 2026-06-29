import { createClient } from "@/lib/supabase/server";
import { ReportsService } from "@/services/dashboard.service";
import StatCard from "@/components/ui/StatCard";
import MonthlyRevenueChart from "@/components/reports/MonthlyRevenueChart";
import InvoicesByStatusChart from "@/components/reports/InvoicesByStatusChart";
import RevenueByRoomTypeChart from "@/components/dashboard/RevenueByRoomTypeChart";
import BookingsByStatusChart from "@/components/dashboard/BookingsByStatusChart";
import RoomTypeAvailabilityChart from "@/components/dashboard/RoomTypeAvailabilityChart";
import { formatAmount } from "@/lib/formatCurrency";

export default async function ReportsPage() {
  const supabase = await createClient();
  const service = new ReportsService(supabase);
  const stats = await service.getStats();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live analytics from bookings, invoices, and rooms in your database.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Invoiced"
          value={formatAmount(stats.totalInvoiced)}
        />
        <StatCard
          label="Total Collected"
          value={formatAmount(stats.totalCollected)}
        />
        <StatCard
          label="Outstanding Due"
          value={formatAmount(stats.totalOutstanding)}
        />
        <StatCard
          label="Invoices"
          value={stats.invoiceCount.toLocaleString()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <MonthlyRevenueChart data={stats.monthlyRevenue} />
        <InvoicesByStatusChart data={stats.invoicesByStatus} />
        <RevenueByRoomTypeChart data={stats.revenueByRoomType} />
        <BookingsByStatusChart data={stats.bookingsByStatus} />
        <RoomTypeAvailabilityChart />
      </div>
    </div>
  );
}
