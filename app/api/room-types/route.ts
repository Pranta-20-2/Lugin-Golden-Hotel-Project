import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RoomTypeService, ServiceError } from "@/services/roomType.service";
import { normalizePaginationParams } from "@/types/pagination";

async function getAuthenticatedService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { service: new RoomTypeService(supabase) };
}

function handleServiceError(error: unknown) {
  if (error instanceof ServiceError) {
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
    const roomTypes = await result.service.getPaginated(pagination);
    return NextResponse.json(roomTypes);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function POST(request: Request) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  try {
    const body = await request.json();
    const roomType = await result.service.create(body);
    return NextResponse.json(roomType, { status: 201 });
  } catch (error) {
    return handleServiceError(error);
  }
}
