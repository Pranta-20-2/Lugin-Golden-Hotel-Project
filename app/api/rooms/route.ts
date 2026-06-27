import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RoomService, RoomServiceError } from "@/services/room.service";
import { normalizePaginationParams } from "@/types/pagination";
import { ROOM_STATUSES, type RoomStatus } from "@/types/room";

async function getAuthenticatedService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { service: new RoomService(supabase) };
}

function handleServiceError(error: unknown) {
  if (error instanceof RoomServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(request: Request) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const pagination = normalizePaginationParams(
      searchParams.get("page"),
      searchParams.get("pageSize"),
      searchParams.get("q")
    );
    const status = searchParams.get("status");
    const rooms = await result.service.getPaginated({
      ...pagination,
      status: ROOM_STATUSES.includes(status as RoomStatus)
        ? (status as RoomStatus)
        : undefined,
    });
    return NextResponse.json(rooms);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function POST(request: Request) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  try {
    const body = await request.json();
    const room = await result.service.create(body);
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
