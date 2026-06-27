import Card from "@/components/ui/Card";
import type { RoomsByStatus } from "@/types/dashboard";

const ROOM_STATUS_COLORS: Record<RoomsByStatus["status"], string> = {
  available: "#22c55e",
  occupied: "#ef4444",
  maintenance: "#f59e0b",
  reserved: "#3b82f6",
};

type RoomsByStatusChartProps = {
  data: RoomsByStatus[];
};

export default function RoomsByStatusChart({ data }: RoomsByStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <Card className="h-full lg:col-span-2">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Rooms by Status & Type
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Current room inventory grouped by status and room type
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Total rooms: {total}
        </p>
      </div>

      {total === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl bg-slate-50 px-4 py-8">
          <p className="text-center text-sm text-slate-500">
            No rooms found. Add rooms to see the status chart.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-full bg-slate-100">
            <div className="flex h-5">
              {data.map((item) => {
                const width = `${(item.count / total) * 100}%`;

                return (
                  <div
                    key={item.status}
                    title={`${item.label}: ${item.count}`}
                    className="h-full"
                    style={{
                      width,
                      backgroundColor: ROOM_STATUS_COLORS[item.status],
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.map((item) => {
              const width = `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 6 : 0)}%`;
              const maxTypeCount = Math.max(
                ...item.roomTypes.map((roomType) => roomType.count),
                1
              );

              return (
                <div
                  key={item.status}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: ROOM_STATUS_COLORS[item.status] }}
                      />
                      <span className="font-semibold text-slate-800">
                        {item.label}
                      </span>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-sm font-bold text-slate-900 shadow-sm ring-1 ring-slate-100">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width,
                        backgroundColor: ROOM_STATUS_COLORS[item.status],
                      }}
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    {item.roomTypes.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No room types in this status.
                      </p>
                    ) : (
                      item.roomTypes.map((roomType) => {
                      const roomTypeWidth = `${Math.max(
                        (roomType.count / maxTypeCount) * 100,
                        8
                      )}%`;

                        return (
                          <div key={`${item.status}-${roomType.name}`}>
                            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                              <span className="truncate font-medium text-slate-600">
                                {roomType.name}
                              </span>
                              <span className="font-semibold text-slate-700">
                                {roomType.count}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white">
                              <div
                                className="h-full rounded-full opacity-80"
                                style={{
                                  width: roomTypeWidth,
                                  backgroundColor: ROOM_STATUS_COLORS[item.status],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
