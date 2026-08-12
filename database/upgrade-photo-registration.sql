-- ================================================================
-- UPGRADE E-JURNAL PKL
-- Fitur: foto jurnal + pendaftaran mandiri siswa + verifikasi admin
-- Jalankan SATU KALI melalui Supabase Dashboard > SQL Editor.
-- Skrip dibuat idempotent sehingga aman dijalankan ulang.
-- ================================================================

create extension if not exists pgcrypto;

-- 1. Kolom dokumentasi foto pada jurnal.
alter table public.daily_journals
  add column if not exists photo_paths text[] not null default '{}'::text[];

-- 2. Status pendaftaran pada profil.
alter table public.profiles
  add column if not exists phone text,
  add column if not exists registration_status text not null default 'approved',
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid;

update public.profiles
set registration_status = 'approved'
where registration_status is null;

-- Constraint dibuat melalui blok agar aman saat dijalankan ulang.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_registration_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_registration_status_check
      check (registration_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;


-- Helper keamanan agar policy tidak bergantung pada policy tabel profiles/student_details.
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

create or replace function public.is_active_student()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
      and p.is_active = true
  );
$$;

create or replace function public.can_access_student(target_student_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid()::text = target_student_id
    or public.is_active_admin()
    or exists (
      select 1 from public.student_details sd
      where sd.id::text = target_student_id
        and (
          sd.teacher_id = auth.uid()
          or sd.field_supervisor_id = auth.uid()
        )
    );
$$;

revoke all on function public.is_active_admin() from public;
revoke all on function public.is_active_student() from public;
revoke all on function public.can_access_student(text) from public;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.is_active_student() to authenticated;
grant execute on function public.can_access_student(text) to authenticated;

-- 3. Tabel link undangan pendaftaran siswa.
create table if not exists public.student_registration_invites (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  full_name text not null,
  nis text not null,
  class_name text not null,
  internship_place text not null,
  teacher_id uuid,
  field_supervisor_id uuid,
  start_date date,
  end_date date,
  status text not null default 'available',
  expires_at timestamptz not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  used_by uuid,
  used_at timestamptz
);

create index if not exists student_registration_invites_created_at_idx
  on public.student_registration_invites (created_at desc);
create index if not exists student_registration_invites_status_idx
  on public.student_registration_invites (status);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'student_registration_invites_status_check'
  ) then
    alter table public.student_registration_invites
      add constraint student_registration_invites_status_check
      check (status in ('available', 'processing', 'used', 'revoked'));
  end if;
end $$;

alter table public.student_registration_invites enable row level security;

-- Hanya administrator aktif yang boleh melihat riwayat undangan dari frontend.
drop policy if exists "admin read registration invites" on public.student_registration_invites;
create policy "admin read registration invites"
on public.student_registration_invites
for select
to authenticated
using (public.is_active_admin());

-- Penambahan/perubahan undangan dilakukan melalui API service role,
-- sehingga tidak diperlukan policy INSERT/UPDATE bagi browser.

-- 4. Bucket privat untuk dokumentasi jurnal.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'journal-photos',
  'journal-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Siswa hanya boleh mengunggah ke folder miliknya sendiri:
-- journal-photos/<UUID SISWA>/tanggal/nama-file.jpg
drop policy if exists "student upload own journal photos" on storage.objects;
create policy "student upload own journal photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'journal-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_student()
);

-- Siswa boleh memperbarui dan menghapus foto di foldernya sendiri.
drop policy if exists "student update own journal photos" on storage.objects;
create policy "student update own journal photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'journal-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_student()
)
with check (
  bucket_id = 'journal-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_student()
);

drop policy if exists "student delete own journal photos" on storage.objects;
create policy "student delete own journal photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'journal-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_student()
);

-- Foto dapat dibaca oleh pemilik, administrator, guru pembimbing,
-- atau pembimbing lapangan yang ditetapkan pada student_details.
drop policy if exists "authorized users read journal photos" on storage.objects;
create policy "authorized users read journal photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'journal-photos'
  and public.can_access_student((storage.foldername(name))[1])
);

-- 5. Nilai awal untuk profil lama.
update public.profiles
set approved_at = coalesce(approved_at, created_at, now())
where registration_status = 'approved'
  and approved_at is null;

-- Pemeriksaan cepat setelah selesai:
select
  'upgrade_ready' as status,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_journals'
      and column_name = 'photo_paths'
  ) as photo_column_ready,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
      and table_name = 'student_registration_invites'
  ) as registration_table_ready,
  exists (
    select 1 from storage.buckets
    where id = 'journal-photos'
  ) as storage_bucket_ready;
