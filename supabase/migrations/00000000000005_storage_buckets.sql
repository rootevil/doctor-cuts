-- Doctor Cuts — Storage buckets.
-- Public read is enforced via the storage.objects RLS policies in migration 4.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery',  'gallery',  true, 10 * 1024 * 1024, array['image/jpeg','image/png','image/webp','image/avif']),
  ('services', 'services', true, 10 * 1024 * 1024, array['image/jpeg','image/png','image/webp','image/avif']),
  ('avatars',  'avatars',  true, 5  * 1024 * 1024, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
