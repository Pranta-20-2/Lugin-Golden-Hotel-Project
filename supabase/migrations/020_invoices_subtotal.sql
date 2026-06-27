-- Legacy invoices table may have subtotal (NOT NULL) from an earlier schema draft.
-- Keep subtotal and total_bill aligned with the app.

alter table public.invoices
  add column if not exists subtotal numeric default 0,
  add column if not exists total_bill numeric default 0;

update public.invoices
set subtotal = coalesce(subtotal, total_bill, 0),
    total_bill = coalesce(total_bill, subtotal, 0);

alter table public.invoices
  alter column subtotal set default 0;

update public.invoices set subtotal = 0 where subtotal is null;
update public.invoices set total_bill = subtotal where total_bill is null;
