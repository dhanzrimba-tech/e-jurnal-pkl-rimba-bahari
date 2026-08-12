-- =====================================================================
-- PERSETUJUAN PENGHAPUSAN AKUN PENGGUNA
-- Alur:
-- 1. Administrator mengajukan penghapusan akun nonadministrator.
-- 2. Alasan penghapusan wajib diisi.
-- 3. Akun belum dihapus saat permintaan dibuat.
-- 4. Administrator meninjau, memberi catatan, lalu menyetujui/menolak.
-- 5. Riwayat keputusan tetap disimpan sebagai audit setelah akun dihapus.
-- Jalankan melalui Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
-- =====================================================================

create extension if not exists pgcrypto;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid,
  target_full_name text not null,
  target_email text not null,
  target_role text not null,
  reason text not null,
  status text not null default 'pending',
  requested_by uuid,
  requested_by_name text,
  requested_at timestamptz not null default now(),
  review_note text,
  reviewed_by uuid,
  reviewed_by_name text,
  reviewed_at timestamptz,
  deleted_at timestamptz,
  warning text,
  constraint account_deletion_requests_target_user_id_fkey
    foreign key (target_user_id) references public.profiles(id) on delete set null,
  constraint account_deletion_requests_requested_by_fkey
    foreign key (requested_by) references public.profiles(id) on delete set null,
  constraint account_deletion_requests_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(id) on delete set null
);

alter table public.account_deletion_requests
  add column if not exists target_user_id uuid,
  add column if not exists target_full_name text,
  add column if not exists target_email text,
  add column if not exists target_role text,
  add column if not exists reason text,
  add column if not exists status text not null default 'pending',
  add column if not exists requested_by uuid,
  add column if not exists requested_by_name text,
  add column if not exists requested_at timestamptz not null default now(),
  add column if not exists review_note text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_by_name text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists warning text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'account_deletion_requests_status_check'
  ) then
    alter table public.account_deletion_requests
      add constraint account_deletion_requests_status_check
      check (status in ('pending', 'approved', 'rejected', 'canceled'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'account_deletion_requests_reason_check'
  ) then
    alter table public.account_deletion_requests
      add constraint account_deletion_requests_reason_check
      check (char_length(btrim(reason)) between 10 and 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'account_deletion_requests_target_role_check'
  ) then
    alter table public.account_deletion_requests
      add constraint account_deletion_requests_target_role_check
      check (target_role in ('student', 'teacher', 'field_supervisor'));
  end if;
end $$;

create index if not exists account_deletion_requests_status_idx
  on public.account_deletion_requests (status, requested_at desc);
create index if not exists account_deletion_requests_target_idx
  on public.account_deletion_requests (target_user_id, requested_at desc);
create unique index if not exists account_deletion_requests_one_pending_idx
  on public.account_deletion_requests (target_user_id)
  where status = 'pending' and target_user_id is not null;

alter table public.account_deletion_requests enable row level security;

drop policy if exists "admin read account deletion requests" on public.account_deletion_requests;
create policy "admin read account deletion requests"
on public.account_deletion_requests
for select
to authenticated
using (public.is_active_admin());

-- INSERT dan UPDATE dilakukan melalui API server memakai service role.
-- Browser hanya membaca riwayat sesuai policy administrator.

select
  'account_delete_approval_ready' as status,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
      and table_name = 'account_deletion_requests'
  ) as request_table_ready,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'account_deletion_requests'
      and policyname = 'admin read account deletion requests'
  ) as read_policy_ready,
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'account_deletion_requests'
      and indexname = 'account_deletion_requests_one_pending_idx'
  ) as pending_guard_ready;
