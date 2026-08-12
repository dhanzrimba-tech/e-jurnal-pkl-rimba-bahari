-- =====================================================================
-- E-JURNAL PKL v6.26 - LAPORAN AKHIR PKL BERBASIS JURNAL
-- Fitur:
-- 1. Siswa menyusun laporan akhir dari data jurnal yang sudah ada.
-- 2. Alur status: draft -> submitted -> revision/approved.
-- 3. Guru pembimbing meninjau, meminta revisi, atau menyetujui laporan.
-- 4. Administrator mengatur identitas dan teks baku laporan sekolah.
-- Jalankan melalui Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
-- =====================================================================

create extension if not exists pgcrypto;

-- Helper hak akses. Didefinisikan ulang agar migration tetap mandiri.
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
        and (sd.teacher_id = auth.uid() or sd.field_supervisor_id = auth.uid())
    );
$$;

create or replace function public.is_assigned_teacher(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_details sd
    join public.profiles p on p.id = auth.uid()
    where sd.id = target_student_id
      and sd.teacher_id = auth.uid()
      and p.role = 'teacher'
      and p.is_active = true
  );
$$;

revoke all on function public.is_active_admin() from public;
revoke all on function public.is_active_student() from public;
revoke all on function public.can_access_student(text) from public;
revoke all on function public.is_assigned_teacher(uuid) from public;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.is_active_student() to authenticated;
grant execute on function public.can_access_student(text) to authenticated;
grant execute on function public.is_assigned_teacher(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- DATA LAPORAN AKHIR PER SISWA
-- ---------------------------------------------------------------------
create table if not exists public.pkl_reports (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  report_title text,
  placement_unit text,
  institution_profile text,
  organization_structure text,
  preface text,
  conclusion text,
  suggestions_school text,
  suggestions_workplace text,
  suggestions_students text,
  status text not null default 'draft',
  teacher_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pkl_reports
  add column if not exists report_title text,
  add column if not exists placement_unit text,
  add column if not exists institution_profile text,
  add column if not exists organization_structure text,
  add column if not exists preface text,
  add column if not exists conclusion text,
  add column if not exists suggestions_school text,
  add column if not exists suggestions_workplace text,
  add column if not exists suggestions_students text,
  add column if not exists status text not null default 'draft',
  add column if not exists teacher_note text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pkl_reports_status_check'
      and conrelid = 'public.pkl_reports'::regclass
  ) then
    alter table public.pkl_reports
      add constraint pkl_reports_status_check
      check (status in ('draft','submitted','revision','approved'));
  end if;
end $$;

alter table public.pkl_reports enable row level security;

drop policy if exists "pkl report readable by authorized users" on public.pkl_reports;
create policy "pkl report readable by authorized users"
on public.pkl_reports
for select
to authenticated
using (public.can_access_student(student_id::text));

-- Tidak ada policy insert/update langsung. Perubahan laporan dilakukan
-- melalui RPC di bawah agar siswa tidak dapat mengubah status persetujuan.
revoke insert, update, delete on public.pkl_reports from authenticated;
grant select on public.pkl_reports to authenticated;

-- ---------------------------------------------------------------------
-- PENGATURAN IDENTITAS DAN TEKS BAKU LAPORAN OLEH ADMINISTRATOR
-- ---------------------------------------------------------------------
create table if not exists public.pkl_report_settings (
  id smallint primary key default 1 check (id = 1),
  school_name text not null default 'SMK Kehutanan Rimba Bahari Sumedang',
  school_year text,
  principal_name text,
  principal_nip text,
  report_title text not null default 'LAPORAN PRAKTIK KERJA LAPANGAN',
  approval_location text default 'Sumedang',
  standard_background text,
  standard_objectives text,
  standard_benefits text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.pkl_report_settings
  add column if not exists school_name text not null default 'SMK Kehutanan Rimba Bahari Sumedang',
  add column if not exists school_year text,
  add column if not exists principal_name text,
  add column if not exists principal_nip text,
  add column if not exists report_title text not null default 'LAPORAN PRAKTIK KERJA LAPANGAN',
  add column if not exists approval_location text default 'Sumedang',
  add column if not exists standard_background text,
  add column if not exists standard_objectives text,
  add column if not exists standard_benefits text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid;

insert into public.pkl_report_settings (
  id, school_name, school_year, report_title, approval_location,
  standard_background, standard_objectives, standard_benefits
)
values (
  1,
  'SMK Kehutanan Rimba Bahari Sumedang',
  '2026/2027',
  'LAPORAN PRAKTIK KERJA LAPANGAN',
  'Sumedang',
  'Praktik Kerja Lapangan merupakan bagian dari proses pembelajaran siswa SMK untuk memperoleh pengalaman kerja nyata, menerapkan kompetensi yang dipelajari di sekolah, serta memahami budaya kerja di dunia usaha, dunia industri, dan instansi pemerintah.',
  E'1. Meningkatkan pengalaman kerja siswa.\n2. Menerapkan kompetensi yang diperoleh di sekolah.\n3. Mengenal budaya dan tata kerja di dunia kerja.\n4. Mengembangkan kedisiplinan dan tanggung jawab.\n5. Meningkatkan keterampilan sesuai bidang keahlian.',
  E'Bagi siswa: menambah pengalaman, pengetahuan, keterampilan, disiplin, dan tanggung jawab kerja.\nBagi sekolah: menjadi bahan evaluasi kesesuaian kompetensi siswa dengan kebutuhan dunia kerja.\nBagi instansi: mendukung kegiatan pendidikan dan memberikan pengalaman kerja kepada peserta didik.'
)
on conflict (id) do nothing;

alter table public.pkl_report_settings enable row level security;

drop policy if exists "authenticated read report settings" on public.pkl_report_settings;
create policy "authenticated read report settings"
on public.pkl_report_settings
for select
to authenticated
using (true);

drop policy if exists "admin insert report settings" on public.pkl_report_settings;
create policy "admin insert report settings"
on public.pkl_report_settings
for insert
to authenticated
with check (public.is_active_admin());

drop policy if exists "admin update report settings" on public.pkl_report_settings;
create policy "admin update report settings"
on public.pkl_report_settings
for update
to authenticated
using (public.is_active_admin())
with check (public.is_active_admin());

grant select, insert, update on public.pkl_report_settings to authenticated;

-- ---------------------------------------------------------------------
-- RPC SISWA: SIMPAN DRAF
-- ---------------------------------------------------------------------
create or replace function public.save_pkl_report(
  p_report_title text,
  p_placement_unit text,
  p_institution_profile text,
  p_organization_structure text,
  p_preface text,
  p_conclusion text,
  p_suggestions_school text,
  p_suggestions_workplace text,
  p_suggestions_students text
)
returns public.pkl_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current public.pkl_reports%rowtype;
  v_result public.pkl_reports%rowtype;
  v_existing_status text;
begin
  if auth.uid() is null or not public.is_active_student() then
    raise exception 'Hanya siswa aktif yang dapat menyimpan laporan PKL.';
  end if;

  select * into v_current
  from public.pkl_reports
  where student_id = auth.uid();

  if found then
    v_existing_status := v_current.status;
  else
    v_existing_status := null;
  end if;

  if v_existing_status in ('submitted','approved') then
    raise exception 'Laporan yang sedang diajukan atau sudah disetujui tidak dapat diedit.';
  end if;

  insert into public.pkl_reports (
    student_id, report_title, placement_unit, institution_profile,
    organization_structure, preface, conclusion, suggestions_school,
    suggestions_workplace, suggestions_students, status, updated_at
  ) values (
    auth.uid(), nullif(trim(p_report_title), ''), nullif(trim(p_placement_unit), ''),
    nullif(trim(p_institution_profile), ''), nullif(trim(p_organization_structure), ''),
    nullif(trim(p_preface), ''), nullif(trim(p_conclusion), ''),
    nullif(trim(p_suggestions_school), ''), nullif(trim(p_suggestions_workplace), ''),
    nullif(trim(p_suggestions_students), ''),
    case when v_existing_status = 'revision' then 'revision' else 'draft' end,
    now()
  )
  on conflict (student_id) do update set
    report_title = excluded.report_title,
    placement_unit = excluded.placement_unit,
    institution_profile = excluded.institution_profile,
    organization_structure = excluded.organization_structure,
    preface = excluded.preface,
    conclusion = excluded.conclusion,
    suggestions_school = excluded.suggestions_school,
    suggestions_workplace = excluded.suggestions_workplace,
    suggestions_students = excluded.suggestions_students,
    status = case when public.pkl_reports.status = 'revision' then 'revision' else 'draft' end,
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC SISWA: AJUKAN LAPORAN
-- ---------------------------------------------------------------------
create or replace function public.submit_pkl_report()
returns public.pkl_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.pkl_reports%rowtype;
  v_approved_count integer;
  v_teacher_id uuid;
begin
  if auth.uid() is null or not public.is_active_student() then
    raise exception 'Hanya siswa aktif yang dapat mengajukan laporan PKL.';
  end if;

  select teacher_id into v_teacher_id
  from public.student_details
  where id = auth.uid();

  if v_teacher_id is null then
    raise exception 'Guru Pembimbing belum ditetapkan. Hubungi administrator sebelum mengajukan laporan.';
  end if;

  select count(*) into v_approved_count
  from public.daily_journals
  where student_id = auth.uid()
    and status = 'approved';

  if v_approved_count < 1 then
    raise exception 'Laporan belum dapat diajukan karena belum ada jurnal yang disetujui.';
  end if;

  select * into v_report
  from public.pkl_reports
  where student_id = auth.uid();

  if not found then
    raise exception 'Simpan draf laporan terlebih dahulu.';
  end if;

  if v_report.status = 'approved' then
    raise exception 'Laporan sudah disetujui.';
  end if;

  if length(trim(coalesce(v_report.institution_profile, ''))) < 30
     or length(trim(coalesce(v_report.preface, ''))) < 50
     or length(trim(coalesce(v_report.conclusion, ''))) < 50 then
    raise exception 'Profil instansi minimal 30 karakter, sedangkan kata pengantar dan kesimpulan minimal 50 karakter sebelum laporan diajukan.';
  end if;

  update public.pkl_reports
  set status = 'submitted',
      submitted_at = now(),
      teacher_note = null,
      reviewed_at = null,
      reviewed_by = null,
      updated_at = now()
  where student_id = auth.uid()
  returning * into v_report;

  return v_report;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC GURU: TINJAU LAPORAN
-- ---------------------------------------------------------------------
create or replace function public.review_pkl_report(
  p_student_id uuid,
  p_status text,
  p_teacher_note text default null
)
returns public.pkl_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.pkl_reports%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sesi login tidak tersedia.';
  end if;

  if not (public.is_assigned_teacher(p_student_id) or public.is_active_admin()) then
    raise exception 'Anda tidak memiliki hak untuk meninjau laporan siswa ini.';
  end if;

  if p_status not in ('revision','approved') then
    raise exception 'Status review tidak valid.';
  end if;

  if p_status = 'revision' and length(trim(coalesce(p_teacher_note, ''))) < 5 then
    raise exception 'Catatan revisi minimal 5 karakter.';
  end if;

  select * into v_report
  from public.pkl_reports
  where student_id = p_student_id;

  if not found then
    raise exception 'Laporan siswa belum tersedia.';
  end if;

  if v_report.status <> 'submitted' then
    raise exception 'Hanya laporan berstatus Diajukan yang dapat ditinjau.';
  end if;

  update public.pkl_reports
  set status = p_status,
      teacher_note = nullif(trim(coalesce(p_teacher_note, '')), ''),
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      updated_at = now()
  where student_id = p_student_id
  returning * into v_report;

  return v_report;
end;
$$;

revoke all on function public.save_pkl_report(text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.submit_pkl_report() from public;
revoke all on function public.review_pkl_report(uuid,text,text) from public;
grant execute on function public.save_pkl_report(text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.submit_pkl_report() to authenticated;
grant execute on function public.review_pkl_report(uuid,text,text) to authenticated;

-- Penanda metadata untuk PostgREST. Tidak perlu tindakan tambahan.
comment on table public.pkl_reports is 'Laporan akhir PKL siswa berbasis jurnal harian E-Jurnal v6.26';
comment on table public.pkl_report_settings is 'Pengaturan identitas dan teks baku laporan PKL sekolah';
