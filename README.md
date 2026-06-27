# Lugin Golden — Hotel Booking System

A hotel booking and management application built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Supabase** (PostgreSQL).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |
| Validation | Zod |
| Architecture | Repository → Service → API → UI |

## Features

### Completed

- **Authentication** — Login, session handling, protected routes via `proxy.ts`
- **Dashboard** — Stats, revenue by room type, bookings by status, rooms by status & type
- **Room Types** — Full CRUD, pagination, debounced search
- **Rooms** — Full CRUD, pagination, debounced search, operational status filter tabs, booking status column
- **Customers** — Full CRUD, pagination, debounced search
- **Bookings** — Full CRUD by room type inventory (no room numbers), advance/due, inline customer onboarding
- **Booking Groups** — Multi-room group bookings by room type quantity, rolled-up totals
- **Invoices & Payments** — Generate invoices from bookings/groups, record payments, sync due amounts

### Planned

- Reports & advanced dashboard filters
- Testing & deployment

## Project Structure

```
app/
  (app)/          # Protected pages (dashboard, room-types, rooms, …)
  api/            # REST API route handlers
  login/          # Public login page
components/       # UI components
repositories/     # Supabase data access
services/         # Business logic & validation
validators/       # Zod schemas
types/            # TypeScript types
lib/              # Supabase clients, utilities
supabase/
  migrations/     # Versioned SQL schema
  seed/           # Optional local dev SQL scripts
proxy.ts          # Auth session & route protection
```

## Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in your Supabase project values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (Supabase → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server only**, optional unless running `npm run db:seed` |

Never commit `.env.local`. Only `.env.example` is tracked in git.

### 3. Database

Run the SQL migrations in order in the **Supabase SQL Editor** (`supabase/migrations/`):

1. `001_room_types.sql`
2. `002_bookings.sql`
3. `007_rooms.sql` *(optional — physical rooms module; bookings do not use room numbers)*
4. `008_customers.sql`
5. `009_customers_national_id.sql` *(only if customers table has old id_number/notes columns)*
6. `011_bookings_phase5.sql` *(customer_id on bookings)*
7. `012_booking_groups.sql`
8. `013_bookings_schema_v2.sql` *(booking no, nights, rate, bill, advance, due)*
9. `014_room_types_total_rooms.sql` *(inventory per room type)*
10. `015_bookings_room_type_id.sql` *(book by room type)*
11. `016_booking_groups_customer_id.sql` *(link groups to customers)*
12. `017_bookings_room_type_inventory.sql` *(drop room_id — no room numbers on bookings)*
13. `018_invoices_payments.sql` *(invoices & payments)*
14. `019_invoices_customer_id_fk.sql` *(ensure booking/group/customer FKs on invoices)*
15. `020_invoices_subtotal.sql` *(align legacy subtotal column with total_bill)*
16. `021_invoices_total.sql` *(align legacy total column with total_bill)*

**Seeds** (after migrations): see `supabase/seed/README.md`

| Order | File |
| --- | --- |
| 1 | `customers_demo.sql` |
| 2 | `room_types_demo.sql` |
| 3 | `bookings_demo.sql` |
| 4 | `booking_groups_demo.sql` |

`npm run db:seed` upserts room types only; run the SQL seed files above for full demo data.

### 4. Auth user

Create at least one user in **Supabase → Authentication → Users** (email/password). Use those credentials to sign in at `/login`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server (webpack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database via service role key |

## API Routes

| Endpoint | Description |
| --- | --- |
| `/api/room-types` | Room type list & create |
| `/api/room-types/[id]` | Room type read, update, delete |
| `/api/rooms` | Room list & create (supports `page`, `pageSize`, `q`, `status`) |
| `/api/rooms/[id]` | Room read, update, delete |
| `/api/customers` | Customer list & create (supports `page`, `pageSize`, `q`) |
| `/api/customers/[id]` | Customer read, update, delete |
| `/api/bookings` | Booking list & create (supports `page`, `pageSize`, `q`, `status`) |
| `/api/bookings/[id]` | Booking read, update, delete |
| `/api/booking-groups` | Group booking list & create |
| `/api/booking-groups/[id]` | Group booking read, update, delete |
| `/api/invoices` | Invoice list & create (supports `?bookingId=` / `?groupId=` on UI) |
| `/api/invoices/[id]` | Invoice read |
| `/api/invoices/[id]/payments` | Record payment on invoice |

All API routes require an authenticated session.

## Development Notes

- Currency is displayed in **Saudi Riyal (SAR)**.
- List pages use server-side pagination and URL-based search (`?q=`) with a 500ms debounce.
- The Rooms page supports operational status tabs: All, Available, Occupied, Maintenance, Reserved.
- The Rooms table shows both **operational status** (room state) and **booking status** (latest linked booking lifecycle status).
- Booking statuses: **Confirmed**, **Checked In**, **Checked Out**, **Cancelled** (default: Confirmed).
- **Bill formula:** `Nights = Check-out − Check-in`, `Total Bill = Nights × Rate`, `Due = Total Bill − Advance Paid`.
- **Availability:** `Available = room_types.total_rooms − overlapping active bookings` for selected dates.
- Group bookings create one child booking row per room type unit, linked via `group_id`.
- Toast notifications use `react-toastify` for create, update, and delete actions.

## Client Workflow Mapping

- **Room Setup** maps to `room_types` (inventory: `total_rooms` per category).
- **Booking List** maps to `customers`, `bookings`, and `booking_groups`.
- **Automatic Calculations** live in booking service logic: nights × room type rate = total bill (SAR).
- **Availability** is derived from room type inventory minus overlapping confirmed/checked_in bookings.

## License

Private project.
