-- Demo customers for Phase 4 preview
-- Run after 008_customers.sql (or 009_customers_national_id.sql if updating an older schema)

insert into public.customers (name, mobile, email, address, national_id)
select v.name, v.mobile, v.email, v.address, v.national_id
from (
  values
    ('Ahmed Al-Rashid', '0501234567', 'ahmed.rashid@example.com', 'Riyadh, Al Olaya', '1023456789'),
    ('Fatima Al-Harbi', '0559876543', 'fatima.harbi@example.com', 'Jeddah, Al Hamra', '2034567890'),
    ('Mohammed Al-Qahtani', '0541122334', null, 'Dammam, Al Faisaliyah', '3045678901'),
    ('Sara Al-Dossari', '0567788990', 'sara.dossari@example.com', 'Riyadh, Al Malaz', null),
    ('Khalid Al-Otaibi', '0534455667', null, 'Makkah, Al Aziziyah', '4056789012'),
    ('Noura Al-Shehri', '0589900112', 'noura.shehri@example.com', 'Medina, Quba', '5067890123'),
    ('Omar Al-Ghamdi', '0523344556', null, 'Abha, Al Manhal', null),
    ('Layla Al-Mutairi', '0576677889', 'layla.mutairi@example.com', 'Khobar, Corniche', '6078901234')
) as v(name, mobile, email, address, national_id)
where not exists (
  select 1 from public.customers c where c.mobile = v.mobile
);

select id, name, mobile, email, national_id from public.customers order by name;
