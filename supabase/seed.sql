-- Doctor Cuts — idempotent seed.
-- Run automatically by `supabase db reset` and by our npm script
-- `supabase:seed`. Safe to re-run: every insert uses on conflict.

-- Settings singleton (business info + booking rules).
insert into public.settings (
  singleton,
  business_name,
  address,
  phone,
  email,
  instagram,
  whatsapp,
  booking_notice_hours,
  max_booking_days,
  cancellation_hours,
  require_confirmation,
  bookings_enabled,
  slot_interval_minutes
) values (
  true,
  'Doctor Cuts',
  'Via Antelmo Severini, 4/c, 62100 Macerata MC',
  '+393481748052',
  'info@dr-cuts.com',
  'https://www.instagram.com/dr_barbiere/',
  'https://wa.me/393481748052',
  2,
  30,
  12,
  false,
  true,
  15
)
on conflict (singleton) do update set
  business_name = excluded.business_name,
  address       = excluded.address,
  phone         = excluded.phone,
  email         = excluded.email,
  instagram     = excluded.instagram,
  whatsapp      = excluded.whatsapp;

-- Business hours (ISO day_of_week, Monday=1 ... Sunday=7).
insert into public.business_hours (day_of_week, open_time, close_time, is_closed) values
  (1, time '08:30', time '21:00', false),
  (2, time '08:30', time '21:00', false),
  (3, time '08:30', time '21:00', false),
  (4, time '08:30', time '21:00', false),
  (5, time '08:30', time '21:00', false),
  (6, time '08:30', time '21:00', false),
  (7, null, null, true)
on conflict (day_of_week) do update set
  open_time  = excluded.open_time,
  close_time = excluded.close_time,
  is_closed  = excluded.is_closed;

-- Seed services. Slugs are stable so this row keeps updating instead of
-- duplicating on each seed run.
-- Migrate legacy catalog slugs if present (keeps appointment FKs intact).
update public.services set slug = 'haircut' where slug = 'signature-cut';
update public.services set slug = 'beard-fade' where slug = 'skin-fade';
update public.services set slug = 'face-mask' where slug = 'beard-sculpt';
update public.services set slug = 'face-massage' where slug = 'full-experience';

insert into public.services (slug, name, description, price, duration_minutes, image_url, sort_order, is_active)
values
  ('haircut',             'Taglio',                            'Taglio di precisione',                 15.00, 30, '/images/cut-detail.jpg', 10, true),
  ('beard-fade',          'Sfumatura barba',                   'Sfumatura barba precisa',              10.00, 25, '/images/beard.jpg',      20, true),
  ('baby-cut',            'Taglio bambino (sotto i 10 anni)',  'Taglio per bambini sotto i 10 anni',   12.00, 25, '/images/cut-detail.jpg', 30, true),
  ('face-threading',      'Filo viso',                         'Depilazione del viso con filo',        10.00, 20, '/images/portrait.jpg',   40, true),
  ('eyebrows-threading',  'Filo sopracciglia',                 'Definizione sopracciglia con filo',     5.00, 15, '/images/portrait.jpg',   50, true),
  ('hair-shampoo',        'Shampoo',                           'Lavaggio capelli',                      3.00, 10, '/images/cut-detail.jpg', 60, true),
  ('face-mask',           'Maschera viso',                     'Trattamento viso rinfrescante',        10.00, 25, '/images/portrait.jpg',   70, true),
  ('face-massage',        'Massaggio viso',                    'Massaggio rilassante del viso',        40.00, 45, '/images/leave.jpg',      80, true)
on conflict (slug) do update set
  name             = excluded.name,
  description      = excluded.description,
  price            = excluded.price,
  duration_minutes = excluded.duration_minutes,
  image_url        = excluded.image_url,
  sort_order       = excluded.sort_order,
  is_active        = excluded.is_active;

-- Seed gallery entries mirroring the currently shipped photography.
-- (We keep the /images paths so the site works before Storage uploads.)
delete from public.gallery where image_url like '/images/%';
insert into public.gallery (image_url, title, category, sort_order, is_featured) values
  ('/images/gallery-01.jpg', 'In studio',  'studio', 10, true),
  ('/images/gallery-02.jpg', 'Ritratto',   'cuts',   20, true),
  ('/images/gallery-03.jpg', 'Sfumatura',  'fade',   30, true),
  ('/images/gallery-04.jpg', 'Al lavoro',  'studio', 40, false),
  ('/images/gallery-05.jpg', 'Texture',    'fade',   50, false),
  ('/images/gallery-06.jpg', 'Design',     'style',  60, false),
  ('/images/gallery-07.jpg', 'Taglio',     'cuts',   70, false),
  ('/images/gallery-08.jpg', 'Linee',      'style',  80, false);
