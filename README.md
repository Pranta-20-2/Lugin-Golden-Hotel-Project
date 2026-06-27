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
- **Rooms** — Full CRUD, pagination, debounced search, status filter tabs

### Planned

- Customer management
- Individual & group bookings
- Invoices & payments
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
3. `003_room_types_seed.sql` *(optional seed)*
4. `004_drop_total_rooms.sql`
5. `005_demo_data.sql` *(optional seed)*
6. `006_recreate_bookings.sql` *(if bookings schema was out of date)*
7. `007_rooms.sql`

Additional optional scripts live in `supabase/seed/` for local preview data.

Alternatively, seed via CLI (requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`):

```bash
npm run db:seed
```

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

All API routes require an authenticated session.

## Development Notes

- Currency is displayed in **Saudi Riyal (SAR)**.
- List pages use server-side pagination and URL-based search (`?q=`) with a 500ms debounce.
- The Rooms page supports status tabs: All, Available, Occupied, Maintenance, Reserved.
- Toast notifications use `react-toastify` for create, update, and delete actions.

## License

Private project.
