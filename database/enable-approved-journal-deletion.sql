-- =====================================================================
-- PERSETUJUAN PENGHAPUSAN JURNAL YANG SUDAH DISETUJUI
-- Alur:
-- 1. Siswa mengajukan permintaan dan wajib menulis alasan.
-- 2. Hanya guru pembimbing yang ditetapkan pada student_details yang
--    dapat menyetujui atau menolak.
-- 3. Jika disetujui, jurnal dihapus secara transaksional dan riwayat
--    permintaan tetap disimpan sebagai audit.
-- Jalankan melalui Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
-- =====================================================================

create extension if not exists pgcrypto;

-- Helper administrator untuk policy baca.
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

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;

create table if not exists public.journal_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid,
  student_id uuid not null,
  teacher_id uuid not null,
  journal_date date not null,
  activity_title text not null,
  journal_description text,
  photo_paths text[] not null default '{}'::text[],
  reason text not null,
  status text not null default 'pending',
  requested_by uuid not null,
  requested_at timestamptz not null default now(),
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  deleted_at timestamptz,
  constraint journal_deletion_requests_journal_id_fkey
    foreign key (journal_id) references public.daily_journals(id) on delete set null,
  constraint journal_deletion_requests_student_id_fkey
    foreign key (student_id) references public.profiles(id),
  constraint journal_deletion_requests_teacher_id_fkey
    foreign key (teacher_id) references public.profiles(id),
  constraint journal_deletion_requests_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(id) on delete set null
);

alter table public.journal_deletion_requests
  add column if not exists journal_id uuid,
  add column if not exists student_id uuid,
  add column if not exists teacher_id uuid,
  add column if not exists journal_date date,
  add column if not exists activity_title text,
  add column if not exists journal_description text,
  add column if not exists photo_paths text[] not null default '{}'::text[],
  add column if not exists reason text,
  add column if not exists status text not null default 'pending',
  add column if not exists requested_by uuid,
  add column if not exists requested_at timestamptz not null default now(),
  add column if not exists review_note text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'journal_deletion_requests_status_check'
  ) then
    alter table public.journal_deletion_requests
      add constraint journal_deletion_requests_status_check
      check (status in ('pending', 'approved', 'rejected', 'canceled'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'journal_deletion_requests_reason_check'
  ) then
    alter table public.journal_deletion_requests
      add constraint journal_deletion_requests_reason_check
      check (char_length(btrim(reason)) between 10 and 1000);
  end if;
end $$;

create index if not exists journal_deletion_requests_student_idx
  on public.journal_deletion_requests (student_id, requested_at desc);
create index if not exists journal_deletion_requests_teacher_idx
  on public.journal_deletion_requests (teacher_id, status, requested_at desc);
create unique index if not exists journal_deletion_requests_one_pending_idx
  on public.journal_deletion_requests (journal_id)
  where status = 'pending' and journal_id is not null;

alter table public.journal_deletion_requests enable row level security;

drop policy if exists "authorized read journal deletion requests" on public.journal_deletion_requests;
create policy "authorized read journal deletion requests"
on public.journal_deletion_requests
for select
to authenticated
using (
  student_id = auth.uid()
  or teacher_id = auth.uid()
  or public.is_active_admin()
);

-- INSERT dan UPDATE dilakukan melalui API server dengan service role.
-- Browser hanya mempunyai akses baca sesuai relasinya.

create or replace function public.approve_journal_deletion_request(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_review_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.journal_deletion_requests%rowtype;
  v_journal public.daily_journals%rowtype;
begin
  if char_length(btrim(coalesce(p_review_note, ''))) < 5 then
    raise exception 'Catatan guru minimal 5 karakter.' using errcode = '22023';
  end if;

  select * into v_request
  from public.journal_deletion_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Permintaan penghapusan tidak ditemukan.' using errcode = 'P0002';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'Permintaan ini sudah pernah diproses.' using errcode = '23514';
  end if;
  if v_request.teacher_id <> p_reviewer_id then
    raise exception 'Permintaan ini bukan untuk guru pembimbing tersebut.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = p_reviewer_id
      and p.role = 'teacher'
      and p.is_active = true
  ) then
    raise exception 'Guru pembimbing tidak aktif atau tidak valid.' using errcode = '42501';
  end if;

  select * into v_journal
  from public.daily_journals
  where id = v_request.journal_id
  for update;

  if not found then
    raise exception 'Jurnal sudah tidak tersedia.' using errcode = 'P0002';
  end if;
  if v_journal.student_id <> v_request.student_id then
    raise exception 'Data siswa pada permintaan tidak sesuai.' using errcode = '23514';
  end if;
  if v_journal.status <> 'approved' then
    raise exception 'Hanya jurnal berstatus disetujui yang dapat diproses melalui alur ini.' using errcode = '23514';
  end if;

  update public.journal_deletion_requests
  set status = 'approved',
      review_note = btrim(p_review_note),
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      deleted_at = now(),
      photo_paths = coalesce(v_journal.photo_paths, '{}'::text[])
  where id = p_request_id;

  delete from public.daily_journals
  where id = v_journal.id;

  return jsonb_build_object(
    'request_id', p_request_id,
    'deleted_journal_id', v_journal.id,
    'photo_paths', to_jsonb(coalesce(v_journal.photo_paths, '{}'::text[]))
  );
end;
$$;

revoke all on function public.approve_journal_deletion_request(uuid, uuid, text) from public;
revoke all on function public.approve_journal_deletion_request(uuid, uuid, text) from anon;
revoke all on function public.approve_journal_deletion_request(uuid, uuid, text) from authenticated;
grant execute on function public.approve_journal_deletion_request(uuid, uuid, text) to service_role;

select
  'approved_delete_workflow_ready' as status,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
      and table_name = 'journal_deletion_requests'
  ) as request_table_ready,
  exists (
    select 1 from pg_proc
    where proname = 'approve_journal_deletion_request'
  ) as approval_function_ready,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_deletion_requests'
      and policyname = 'authorized read journal deletion requests'
  ) as read_policy_ready;
