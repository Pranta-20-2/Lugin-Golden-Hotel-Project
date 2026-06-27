-- Room types table
create table if not exists public.room_types (
  id bigint generated always as identity primary key,
  name text not null,
  rate_per_night numeric not null check (rate_per_night > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists room_types_name_key on public.room_types (name);

alter table public.room_types enable row level security;

create policy "Authenticated users can select room_types"
  on public.room_types for select
  to authenticated
  using (true);

create policy "Authenticated users can insert room_types"
  on public.room_types for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update room_types"
  on public.room_types for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete room_types"
  on public.room_types for delete
  to authenticated
  using (true);
