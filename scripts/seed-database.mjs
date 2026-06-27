/**
 * Seed room_types + demo bookings into remote Supabase.
 *
 * Setup (one time):
 * 1. Supabase Dashboard → Project Settings → API
 * 2. Copy the "service_role" secret key (NOT the publishable key)
 * 3. Add to .env.local at project root:
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 *
 * Run from project root: npm run db:seed
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = resolve(projectRoot, ".env.local");
  if (!existsSync(envPath)) {
    console.error(`\n.env.local not found at: ${envPath}`);
    return false;
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
  return true;
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  console.error(`
Missing NEXT_PUBLIC_SUPABASE_URL in .env.local
Expected file: ${resolve(projectRoot, ".env.local")}
`);
  process.exit(1);
}

if (!serviceKey) {
  console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY in .env.local

Your .env.local currently has the publishable key only. The seed script needs
the service_role key to insert data (bypasses RLS for one-time setup).

Steps:
  1. Supabase Dashboard → Settings → API
  2. Under "Project API keys", copy the service_role secret
  3. Add this line to .env.local (project root):
     SUPABASE_SERVICE_ROLE_KEY=paste_key_here
  4. Run again from project root:
     cd ${projectRoot}
     npm run db:seed

Alternative (no service key): paste SQL in Supabase SQL Editor:
  supabase/seed/insert_room_types_only.sql
`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const roomTypes = [
  { name: "Single Room", rate_per_night: 1500, notes: "For 1 person" },
  { name: "Double Room", rate_per_night: 2500, notes: "For 2 people" },
  { name: "Deluxe Room", rate_per_night: 3500, notes: "AC, for 2 people" },
  { name: "Suite Room", rate_per_night: 5500, notes: "Includes living space" },
  { name: "VIP Room", rate_per_night: 8000, notes: "Premium" },
];

const demoBookings = [
  { room_type_name: "Single Room", status: "pending", total_amount: 1500, check_in: "2026-06-25", check_out: "2026-06-26" },
  { room_type_name: "Single Room", status: "confirmed", total_amount: 4500, check_in: "2026-06-28", check_out: "2026-07-01" },
  { room_type_name: "Single Room", status: "checked_out", total_amount: 3000, check_in: "2026-06-10", check_out: "2026-06-12" },
  { room_type_name: "Double Room", status: "confirmed", total_amount: 5000, check_in: "2026-06-27", check_out: "2026-06-29" },
  { room_type_name: "Double Room", status: "checked_in", total_amount: 7500, check_in: "2026-06-26", check_out: "2026-06-29" },
  { room_type_name: "Double Room", status: "cancelled", total_amount: 2500, check_in: "2026-07-05", check_out: "2026-07-06" },
  { room_type_name: "Deluxe Room", status: "confirmed", total_amount: 10500, check_in: "2026-07-01", check_out: "2026-07-04" },
  { room_type_name: "Deluxe Room", status: "checked_out", total_amount: 7000, check_in: "2026-06-15", check_out: "2026-06-17" },
  { room_type_name: "Suite Room", status: "checked_in", total_amount: 11000, check_in: "2026-06-26", check_out: "2026-06-28" },
  { room_type_name: "Suite Room", status: "checked_out", total_amount: 16500, check_in: "2026-06-01", check_out: "2026-06-04" },
  { room_type_name: "VIP Room", status: "confirmed", total_amount: 16000, check_in: "2026-07-10", check_out: "2026-07-12" },
  { room_type_name: "VIP Room", status: "pending", total_amount: 8000, check_in: "2026-07-15", check_out: "2026-07-16" },
];

async function main() {
  console.log("Seeding room types...");

  for (const rt of roomTypes) {
    const { data: existing } = await supabase
      .from("room_types")
      .select("id")
      .eq("name", rt.name)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("room_types")
        .update({ rate_per_night: rt.rate_per_night, notes: rt.notes })
        .eq("id", existing.id);
      if (error) throw error;
      console.log(`  Updated: ${rt.name}`);
    } else {
      const { error } = await supabase.from("room_types").insert(rt);
      if (error) throw error;
      console.log(`  Inserted: ${rt.name}`);
    }
  }

  const { data: allTypes, error: typesError } = await supabase
    .from("room_types")
    .select("id, name");

  if (typesError) throw typesError;

  const typeMap = new Map(allTypes.map((t) => [t.name, t.id]));

  console.log("Seeding demo bookings...");
  await supabase.from("bookings").delete().neq("id", 0);

  const bookings = demoBookings.map((b) => ({
    room_type_id: typeMap.get(b.room_type_name),
    status: b.status,
    total_amount: b.total_amount,
    check_in: b.check_in,
    check_out: b.check_out,
  }));

  const { error: bookingsError } = await supabase.from("bookings").insert(bookings);
  if (bookingsError) {
    console.warn("  Bookings skipped (run 002_bookings.sql first):", bookingsError.message);
  } else {
    console.log(`  Inserted ${bookings.length} demo bookings`);
  }

  const { count } = await supabase
    .from("room_types")
    .select("*", { count: "exact", head: true });

  console.log(`\nDone! room_types count: ${count}`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
