/**
 * Database seed helper — upserts room types with total_rooms inventory.
 *
 * For full demo data (customers, bookings, groups), run the SQL files in
 * supabase/seed/ via Supabase SQL Editor (see supabase/seed/README.md).
 *
 * Run: npm run db:seed
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
  console.error(`\nMissing NEXT_PUBLIC_SUPABASE_URL in .env.local`);
  process.exit(1);
}

if (!serviceKey) {
  console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY in .env.local

For full demo data, paste SQL from supabase/seed/ into Supabase SQL Editor:
  1. customers_demo.sql
  2. room_types_demo.sql
  3. bookings_demo.sql
  4. booking_groups_demo.sql

See supabase/seed/README.md for details.
`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const roomTypes = [
  { name: "Single Room", rate_per_night: 1500, total_rooms: 6, notes: "For 1 person" },
  { name: "Double Room", rate_per_night: 2500, total_rooms: 8, notes: "For 2 people" },
  { name: "Deluxe Room", rate_per_night: 3500, total_rooms: 5, notes: "AC, for 2 people" },
  { name: "Suite Room", rate_per_night: 5500, total_rooms: 3, notes: "Includes living space" },
  { name: "VIP Room", rate_per_night: 8000, total_rooms: 2, notes: "Premium" },
];

async function main() {
  console.log("Seeding room types (inventory model)...");

  for (const rt of roomTypes) {
    const { data: existing } = await supabase
      .from("room_types")
      .select("id")
      .eq("name", rt.name)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("room_types")
        .update({
          rate_per_night: rt.rate_per_night,
          total_rooms: rt.total_rooms,
          notes: rt.notes,
        })
        .eq("id", existing.id);
      if (error) throw error;
      console.log(`  Updated: ${rt.name}`);
    } else {
      const { error } = await supabase.from("room_types").insert(rt);
      if (error) throw error;
      console.log(`  Inserted: ${rt.name}`);
    }
  }

  console.log(`
Done! Room types seeded.

For customers, bookings, and group bookings, run SQL in Supabase SQL Editor:
  supabase/seed/customers_demo.sql
  supabase/seed/bookings_demo.sql
  supabase/seed/booking_groups_demo.sql
`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
