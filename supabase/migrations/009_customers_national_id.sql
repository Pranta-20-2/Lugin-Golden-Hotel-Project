-- Align existing customers table with national_id schema (if 008 was run with id_number/notes)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'id_number'
  ) then
    alter table public.customers rename column id_number to national_id;
  end if;
end $$;

alter table public.customers
  drop column if exists notes;

alter table public.customers
  alter column created_at type timestamp using created_at::timestamp,
  alter column created_at set default now();

alter table public.customers
  alter column updated_at type timestamp using updated_at::timestamp,
  alter column updated_at set default now();

drop index if exists public.customers_mobile_key;
