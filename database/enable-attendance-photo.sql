-- ================================================================
-- E-JURNAL PKL v6.17 - FOTO PRESENSI
-- Jalankan melalui Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
-- ================================================================

alter table public.attendance
  add column if not exists photo_paths text[] not null default '{}'::text[];

-- Pastikan bucket privat yang sudah dipakai dokumentasi jurnal tersedia.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('journal-photos','journal-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Helper akses; aman menggantikan versi lama dengan fungsi yang setara.
create or replace function public.is_active_student()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='student' and p.is_active=true);
$$;

create or replace function public.is_active_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin' and p.is_active=true);
$$;

create or replace function public.can_access_student(target_student_id text)
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid()::text=target_student_id
    or public.is_active_admin()
    or exists(select 1 from public.student_details sd where sd.id::text=target_student_id and (sd.teacher_id=auth.uid() or sd.field_supervisor_id=auth.uid()));
$$;

grant execute on function public.is_active_student() to authenticated;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.can_access_student(text) to authenticated;

-- Kebijakan bucket menggunakan folder pertama sebagai UUID siswa.
drop policy if exists "student upload own journal photos" on storage.objects;
create policy "student upload own journal photos" on storage.objects for insert to authenticated
with check(bucket_id='journal-photos' and (storage.foldername(name))[1]=auth.uid()::text and public.is_active_student());

drop policy if exists "student update own journal photos" on storage.objects;
create policy "student update own journal photos" on storage.objects for update to authenticated
using(bucket_id='journal-photos' and (storage.foldername(name))[1]=auth.uid()::text and public.is_active_student())
with check(bucket_id='journal-photos' and (storage.foldername(name))[1]=auth.uid()::text and public.is_active_student());

drop policy if exists "student delete own journal photos" on storage.objects;
create policy "student delete own journal photos" on storage.objects for delete to authenticated
using(bucket_id='journal-photos' and (storage.foldername(name))[1]=auth.uid()::text and public.is_active_student());

drop policy if exists "authorized users read journal photos" on storage.objects;
create policy "authorized users read journal photos" on storage.objects for select to authenticated
using(bucket_id='journal-photos' and public.can_access_student((storage.foldername(name))[1]));

select
  'attendance_photo_ready' as status,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='attendance' and column_name='photo_paths') as attendance_photo_column_ready,
  exists(select 1 from storage.buckets where id='journal-photos') as storage_bucket_ready;
