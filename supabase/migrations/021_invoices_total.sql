-- Legacy invoices table may also have total (NOT NULL) from an earlier schema draft.
-- Keep total, subtotal, and total_bill aligned with the app.

alter table public.invoices
  add column if not exists total numeric default 0,
  add column if not exists subtotal numeric default 0,
  add column if not exists total_bill numeric default 0;

update public.invoices
set
  total = coalesce(total, total_bill, subtotal, 0),
  subtotal = coalesce(subtotal, total_bill, total, 0),
  total_bill = coalesce(total_bill, total, subtotal, 0);

alter table public.invoices
  alter column total set default 0,
  alter column subtotal set default 0;

update public.invoices set total = 0 where total is null;
update public.invoices set subtotal = coalesce(subtotal, total, 0) where subtotal is null;
update public.invoices set total_bill = coalesce(total_bill, total, 0) where total_bill is null;
