-- Remove the separate payments table; invoices now store cash received and due amounts directly.

drop table if exists public.payments;
