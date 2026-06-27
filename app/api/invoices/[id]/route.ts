import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  InvoiceService,
  InvoiceServiceError,
} from "@/services/invoice.service";

type RouteParams = { params: Promise<{ id: string }> };

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

  return { service: new InvoiceService(supabase) };
}

function handleServiceError(error: unknown) {
  if (error instanceof InvoiceServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(_request: Request, { params }: RouteParams) {
  const result = await getAuthenticatedService();
  if ("error" in result) return result.error;

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
  }

  try {
    const invoice = await result.service.getById(numericId);
    return NextResponse.json(invoice);
  } catch (error) {
    return handleServiceError(error);
  }
}
