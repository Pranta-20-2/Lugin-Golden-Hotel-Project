import { createClient } from "@/lib/supabase/server";
import { DashboardService } from "@/services/dashboard.service";
import StatCard from "@/components/ui/StatCard";
import RevenueByRoomTypeChart from "@/components/dashboard/RevenueByRoomTypeChart";
import BookingsByStatusChart from "@/components/dashboard/BookingsByStatusChart";
import RoomTypeAvailabilityChart from "@/components/dashboard/RoomTypeAvailabilityChart";
import { formatAmount } from "@/lib/formatCurrency";

export default async function DashboardPage() {
  const supabase = await createClient();
  const service = new DashboardService(supabase);
  const stats = await service.getStats();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Collected"
          value={formatAmount(stats.totalRevenue)}
        />
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
        />
        <StatCard
          label="Room Types"
          value={stats.roomTypeCount.toString()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <RevenueByRoomTypeChart data={stats.revenueByRoomType} />
        <BookingsByStatusChart data={stats.bookingsByStatus} />
        <RoomTypeAvailabilityChart />
      </div>
    </div>
  );
}
