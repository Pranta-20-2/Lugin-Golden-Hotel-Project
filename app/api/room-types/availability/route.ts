import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RoomTypeService } from "@/services/roomType.service";
import { getTodayAvailabilityRange } from "@/lib/roomTypeAvailability";

export async function GET(request: Request) {
  const supabase = await createClient();
  const service = new RoomTypeService(supabase);
  const { searchParams } = new URL(request.url);

  const useToday = searchParams.get("today") === "1";
  const checkInParam = searchParams.get("check_in");
  const checkOutParam = searchParams.get("check_out");

  const { checkIn, checkOut } =
    useToday || !checkInParam || !checkOutParam
      ? getTodayAvailabilityRange()
      : { checkIn: checkInParam, checkOut: checkOutParam };

  if (new Date(checkOut) <= new Date(checkIn)) {
    return NextResponse.json(
      { error: "check_out must be after check_in" },
      { status: 400 }
    );
  }
  const excludeBookingId = searchParams.get("exclude_booking_id");
  const excludeGroupId = searchParams.get("exclude_group_id");

  try {
    const roomTypes = await service.getAllWithAvailability(checkIn, checkOut, {
      excludeBookingId: excludeBookingId ? Number(excludeBookingId) : undefined,
      excludeGroupId: excludeGroupId ? Number(excludeGroupId) : undefined,
    });

    return NextResponse.json(roomTypes);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load availability";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
