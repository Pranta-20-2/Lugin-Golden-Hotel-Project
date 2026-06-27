import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  BookingService,
  BookingServiceError,
} from "@/services/booking.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAuthenticatedService() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { service: new BookingService(supabase) };
}

function handleServiceError(error: unknown) {
  if (error instanceof BookingServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(_request: Request, context: RouteContext) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  const { id } = await context.params;
  const numericId = Number(id);

  try {
    const booking = await result.service.getById(numericId);
    return NextResponse.json(booking);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  const { id } = await context.params;
  const numericId = Number(id);

  try {
    const body = await request.json();
    const booking = await result.service.update(numericId, body);
    return NextResponse.json(booking);
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  const { id } = await context.params;
  const numericId = Number(id);

  try {
    await result.service.delete(numericId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleServiceError(error);
  }
}
