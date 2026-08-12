-- =====================================================================
-- E-JURNAL PKL v6.28 - LAPORAN PKL KELOMPOK BERDASARKAN LOKASI PRAKTIK
-- Fitur:
-- 1. Kelompok terbentuk otomatis dari internship_place yang sama.
-- 2. Satu laporan bersama per lokasi praktik.
-- 3. Seluruh jurnal berstatus approved milik anggota digabung otomatis.
-- 4. Siswa satu lokasi dapat menyunting draf/revisi secara kolaboratif.
-- 5. Guru pembimbing yang memiliki siswa pada lokasi tersebut dapat review.
-- 6. Admin dan pembimbing lapangan dapat melihat/cetak sesuai akses.
-- 7. Foto jurnal anggota satu kelompok dapat dibaca untuk laporan kelompok.
-- Jalankan SETELAH database/upgrade-final-pkl-report.sql v6.26.
-- Aman dijalankan ulang.
-- =====================================================================

create extension if not exists pgcrypto;

create or replace function public.pkl_location_key(value text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(value, '')), E'\\s+', ' ', 'g'));
$$;

grant execute on function public.pkl_location_key(text) to authenticated;

create or replace function public.can_access_pkl_group(target_group_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles me
    where me.id = auth.uid()
      and me.is_active = true
      and (
        me.role = 'admin'
        or exists (
          select 1
          from public.student_details sd
          where public.pkl_location_key(sd.internship_place) = public.pkl_location_key(target_group_key)
            and (
              (me.role = 'student' and sd.id = auth.uid())
              or (me.role = 'teacher' and sd.teacher_id = auth.uid())
              or (me.role = 'field_supervisor' and sd.field_supervisor_id = auth.uid())
            )
        )
      )
  );
$$;

create or replace function public.can_review_pkl_group(target_group_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles me
    where me.id = auth.uid()
      and me.is_active = true
      and (
        me.role = 'admin'
        or (
          me.role = 'teacher'
          and exists (
            select 1 from public.student_details sd
            where sd.teacher_id = auth.uid()
              and public.pkl_location_key(sd.internship_place) = public.pkl_location_key(target_group_key)
          )
        )
      )
  );
$$;

create or replace function public.can_access_group_student(target_student_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select public.can_access_pkl_group(public.pkl_location_key(sd.internship_place))
    from public.student_details sd
    where sd.id::text = target_student_id
  ), false);
$$;

revoke all on function public.can_access_pkl_group(text) from public;
revoke all on function public.can_review_pkl_group(text) from public;
revoke all on function public.can_access_group_student(text) from public;
grant execute on function public.can_access_pkl_group(text) to authenticated;
grant execute on function public.can_review_pkl_group(text) to authenticated;
grant execute on function public.can_access_group_student(text) to authenticated;

-- ---------------------------------------------------------------------
-- LAPORAN KELOMPOK PER LOKASI PRAKTIK
-- ---------------------------------------------------------------------
create table if not exists public.pkl_group_reports (
  group_key text primary key,
  internship_place text not null,
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
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pkl_group_reports
  add column if not exists internship_place text,
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
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pkl_group_reports_status_check'
      and conrelid = 'public.pkl_group_reports'::regclass
  ) then
    alter table public.pkl_group_reports
      add constraint pkl_group_reports_status_check
      check (status in ('draft','submitted','revision','approved'));
  end if;
end $$;

alter table public.pkl_group_reports enable row level security;

drop policy if exists "pkl group report readable by authorized users" on public.pkl_group_reports;
create policy "pkl group report readable by authorized users"
on public.pkl_group_reports
for select
to authenticated
using (public.can_access_pkl_group(group_key));

revoke insert, update, delete on public.pkl_group_reports from authenticated;
grant select on public.pkl_group_reports to authenticated;

-- ---------------------------------------------------------------------
-- DAFTAR KELOMPOK YANG DAPAT DIAKSES PENGGUNA
-- ---------------------------------------------------------------------
create or replace function public.list_pkl_groups()
returns table (
  group_key text,
  internship_place text,
  member_count bigint,
  member_names text,
  teacher_names text,
  field_supervisor_names text,
  status text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select role from public.profiles
    where id = auth.uid() and is_active = true
  ), accessible as (
    select distinct public.pkl_location_key(sd.internship_place) as group_key
    from public.student_details sd
    join public.profiles sp on sp.id = sd.id and sp.role = 'student' and sp.is_active = true
    cross join me
    where nullif(trim(coalesce(sd.internship_place, '')), '') is not null
      and (
        me.role = 'admin'
        or (me.role = 'student' and sd.id = auth.uid())
        or (me.role = 'teacher' and sd.teacher_id = auth.uid())
        or (me.role = 'field_supervisor' and sd.field_supervisor_id = auth.uid())
      )
  ), grouped as (
    select
      public.pkl_location_key(sd.internship_place) as group_key,
      min(trim(sd.internship_place)) as internship_place,
      count(*)::bigint as member_count,
      string_agg(coalesce(p.full_name, '-'), ', ' order by coalesce(p.full_name, '-')) as member_names,
      string_agg(distinct coalesce(t.full_name, ''), ', ' order by coalesce(t.full_name, '')) filter (where t.full_name is not null) as teacher_names,
      string_agg(distinct coalesce(f.full_name, ''), ', ' order by coalesce(f.full_name, '')) filter (where f.full_name is not null) as field_supervisor_names
    from public.student_details sd
    join accessible a on a.group_key = public.pkl_location_key(sd.internship_place)
    join public.profiles p on p.id = sd.id and p.role = 'student' and p.is_active = true
    left join public.profiles t on t.id = sd.teacher_id
    left join public.profiles f on f.id = sd.field_supervisor_id
    group by public.pkl_location_key(sd.internship_place)
  )
  select
    g.group_key,
    coalesce(gr.internship_place, g.internship_place) as internship_place,
    g.member_count,
    g.member_names,
    g.teacher_names,
    g.field_supervisor_names,
    gr.status,
    gr.updated_at
  from grouped g
  left join public.pkl_group_reports gr on gr.group_key = g.group_key
  order by coalesce(gr.internship_place, g.internship_place);
$$;

-- ---------------------------------------------------------------------
-- KONTEKS LENGKAP KELOMPOK: ANGGOTA + JURNAL APPROVED + LAPORAN
-- ---------------------------------------------------------------------
create or replace function public.get_pkl_group_context(p_group_key text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_key text;
  v_place text;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Sesi login tidak tersedia.';
  end if;

  if nullif(trim(coalesce(p_group_key, '')), '') is null then
    select public.pkl_location_key(sd.internship_place), trim(sd.internship_place)
      into v_key, v_place
    from public.student_details sd
    join public.profiles p on p.id = auth.uid()
    where sd.id = auth.uid()
      and p.role = 'student'
      and p.is_active = true;
  else
    v_key := public.pkl_location_key(p_group_key);
  end if;

  if nullif(v_key, '') is null then
    raise exception 'Lokasi PKL belum diisi. Hubungi administrator.';
  end if;

  if not public.can_access_pkl_group(v_key) then
    raise exception 'Anda tidak memiliki akses ke laporan kelompok lokasi ini.';
  end if;

  select min(trim(sd.internship_place)) into v_place
  from public.student_details sd
  where public.pkl_location_key(sd.internship_place) = v_key;

  select jsonb_build_object(
    'group_key', v_key,
    'internship_place', coalesce((select gr.internship_place from public.pkl_group_reports gr where gr.group_key = v_key), v_place),
    'report', (select to_jsonb(gr) from public.pkl_group_reports gr where gr.group_key = v_key),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', sd.id,
        'nis', sd.nis,
        'class_name', sd.class_name,
        'start_date', sd.start_date,
        'end_date', sd.end_date,
        'internship_place', sd.internship_place,
        'full_name', p.full_name,
        'email', p.email,
        'teacher_id', sd.teacher_id,
        'teacher_name', t.full_name,
        'field_supervisor_id', sd.field_supervisor_id,
        'field_supervisor_name', f.full_name
      ) order by coalesce(sd.nis,''), coalesce(p.full_name,''))
      from public.student_details sd
      join public.profiles p on p.id = sd.id
      left join public.profiles t on t.id = sd.teacher_id
      left join public.profiles f on f.id = sd.field_supervisor_id
      where public.pkl_location_key(sd.internship_place) = v_key
        and p.role = 'student'
        and p.is_active = true
    ), '[]'::jsonb),
    'journals', coalesce((
      select jsonb_agg(
        to_jsonb(j) || jsonb_build_object(
          'student_name', p.full_name,
          'student_nis', sd.nis,
          'student_class', sd.class_name
        ) order by j.journal_date, coalesce(p.full_name,'')
      )
      from public.daily_journals j
      join public.student_details sd on sd.id = j.student_id
      join public.profiles p on p.id = j.student_id
      where public.pkl_location_key(sd.internship_place) = v_key
        and j.status = 'approved'
        and p.is_active = true
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------
-- SIMPAN DRAF LAPORAN KELOMPOK OLEH ANGGOTA KELOMPOK
-- ---------------------------------------------------------------------
create or replace function public.save_group_pkl_report(
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
returns public.pkl_group_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_place text;
  v_current public.pkl_group_reports%rowtype;
  v_result public.pkl_group_reports%rowtype;
begin
  if auth.uid() is null or not public.is_active_student() then
    raise exception 'Hanya siswa aktif yang dapat menyimpan laporan kelompok.';
  end if;

  select public.pkl_location_key(sd.internship_place), trim(sd.internship_place)
    into v_key, v_place
  from public.student_details sd
  where sd.id = auth.uid();

  if nullif(v_key, '') is null then
    raise exception 'Lokasi PKL belum diisi. Hubungi administrator.';
  end if;

  select * into v_current from public.pkl_group_reports where group_key = v_key;
  if found and v_current.status in ('submitted','approved') then
    raise exception 'Laporan kelompok yang sedang diajukan atau sudah disetujui tidak dapat diedit.';
  end if;

  insert into public.pkl_group_reports (
    group_key, internship_place, report_title, placement_unit, institution_profile,
    organization_structure, preface, conclusion, suggestions_school,
    suggestions_workplace, suggestions_students, status,
    created_by, updated_by, updated_at
  ) values (
    v_key, v_place, nullif(trim(p_report_title), ''), nullif(trim(p_placement_unit), ''),
    nullif(trim(p_institution_profile), ''), nullif(trim(p_organization_structure), ''),
    nullif(trim(p_preface), ''), nullif(trim(p_conclusion), ''),
    nullif(trim(p_suggestions_school), ''), nullif(trim(p_suggestions_workplace), ''),
    nullif(trim(p_suggestions_students), ''),
    case when found and v_current.status = 'revision' then 'revision' else 'draft' end,
    auth.uid(), auth.uid(), now()
  )
  on conflict (group_key) do update set
    internship_place = excluded.internship_place,
    report_title = excluded.report_title,
    placement_unit = excluded.placement_unit,
    institution_profile = excluded.institution_profile,
    organization_structure = excluded.organization_structure,
    preface = excluded.preface,
    conclusion = excluded.conclusion,
    suggestions_school = excluded.suggestions_school,
    suggestions_workplace = excluded.suggestions_workplace,
    suggestions_students = excluded.suggestions_students,
    status = case when public.pkl_group_reports.status = 'revision' then 'revision' else 'draft' end,
    updated_by = auth.uid(),
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------
-- AJUKAN LAPORAN KELOMPOK
-- ---------------------------------------------------------------------
create or replace function public.submit_group_pkl_report()
returns public.pkl_group_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_report public.pkl_group_reports%rowtype;
  v_member_count integer;
  v_ready_count integer;
  v_teacher_count integer;
begin
  if auth.uid() is null or not public.is_active_student() then
    raise exception 'Hanya siswa aktif yang dapat mengajukan laporan kelompok.';
  end if;

  select public.pkl_location_key(sd.internship_place) into v_key
  from public.student_details sd
  where sd.id = auth.uid();

  if nullif(v_key, '') is null then
    raise exception 'Lokasi PKL belum diisi. Hubungi administrator.';
  end if;

  select count(*) into v_member_count
  from public.student_details sd
  join public.profiles p on p.id = sd.id
  where public.pkl_location_key(sd.internship_place) = v_key
    and p.role = 'student' and p.is_active = true;

  if v_member_count < 2 then
    raise exception 'Laporan kelompok membutuhkan minimal 2 siswa pada lokasi PKL yang sama.';
  end if;

  select count(*) into v_ready_count
  from public.student_details sd
  join public.profiles p on p.id = sd.id
  where public.pkl_location_key(sd.internship_place) = v_key
    and p.role = 'student' and p.is_active = true
    and exists (
      select 1 from public.daily_journals j
      where j.student_id = sd.id and j.status = 'approved'
    );

  if v_ready_count < v_member_count then
    raise exception 'Laporan belum dapat diajukan. Setiap anggota kelompok harus memiliki minimal 1 jurnal yang disetujui.';
  end if;

  select count(distinct sd.teacher_id) into v_teacher_count
  from public.student_details sd
  where public.pkl_location_key(sd.internship_place) = v_key
    and sd.teacher_id is not null;

  if v_teacher_count < 1 then
    raise exception 'Guru Pembimbing kelompok belum ditetapkan. Hubungi administrator.';
  end if;

  select * into v_report from public.pkl_group_reports where group_key = v_key;
  if not found then raise exception 'Simpan draf laporan kelompok terlebih dahulu.'; end if;
  if v_report.status = 'approved' then raise exception 'Laporan kelompok sudah disetujui.'; end if;

  if length(trim(coalesce(v_report.institution_profile, ''))) < 30
     or length(trim(coalesce(v_report.preface, ''))) < 50
     or length(trim(coalesce(v_report.conclusion, ''))) < 50 then
    raise exception 'Profil instansi minimal 30 karakter, sedangkan kata pengantar dan kesimpulan minimal 50 karakter sebelum laporan diajukan.';
  end if;

  update public.pkl_group_reports
  set status = 'submitted', submitted_at = now(), teacher_note = null,
      reviewed_at = null, reviewed_by = null, updated_by = auth.uid(), updated_at = now()
  where group_key = v_key
  returning * into v_report;

  return v_report;
end;
$$;

-- ---------------------------------------------------------------------
-- REVIEW GURU / ADMIN
-- ---------------------------------------------------------------------
create or replace function public.review_group_pkl_report(
  p_group_key text,
  p_status text,
  p_teacher_note text default null
)
returns public.pkl_group_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := public.pkl_location_key(p_group_key);
  v_report public.pkl_group_reports%rowtype;
begin
  if auth.uid() is null then raise exception 'Sesi login tidak tersedia.'; end if;
  if not public.can_review_pkl_group(v_key) then
    raise exception 'Anda tidak memiliki hak untuk meninjau laporan kelompok ini.';
  end if;
  if p_status not in ('revision','approved') then raise exception 'Status review tidak valid.'; end if;
  if p_status = 'revision' and length(trim(coalesce(p_teacher_note, ''))) < 5 then
    raise exception 'Catatan revisi minimal 5 karakter.';
  end if;

  select * into v_report from public.pkl_group_reports where group_key = v_key;
  if not found then raise exception 'Laporan kelompok belum tersedia.'; end if;
  if v_report.status <> 'submitted' then raise exception 'Hanya laporan berstatus Diajukan yang dapat ditinjau.'; end if;

  update public.pkl_group_reports
  set status = p_status,
      teacher_note = nullif(trim(coalesce(p_teacher_note, '')), ''),
      reviewed_at = now(), reviewed_by = auth.uid(), updated_at = now()
  where group_key = v_key
  returning * into v_report;

  return v_report;
end;
$$;

revoke all on function public.list_pkl_groups() from public;
revoke all on function public.get_pkl_group_context(text) from public;
revoke all on function public.save_group_pkl_report(text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.submit_group_pkl_report() from public;
revoke all on function public.review_group_pkl_report(text,text,text) from public;
grant execute on function public.list_pkl_groups() to authenticated;
grant execute on function public.get_pkl_group_context(text) to authenticated;
grant execute on function public.save_group_pkl_report(text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.submit_group_pkl_report() to authenticated;
grant execute on function public.review_group_pkl_report(text,text,text) to authenticated;

-- Foto anggota kelompok dapat dibaca untuk menyusun laporan kelompok.
drop policy if exists "group report readers read journal photos" on storage.objects;
create policy "group report readers read journal photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'journal-photos'
  and public.can_access_group_student((storage.foldername(name))[1])
);

comment on table public.pkl_group_reports is 'Laporan akhir PKL kelompok yang terbentuk otomatis berdasarkan lokasi praktik, E-Jurnal v6.28';
comment on function public.list_pkl_groups() is 'Daftar kelompok PKL berdasarkan lokasi yang dapat diakses pengguna';
comment on function public.get_pkl_group_context(text) is 'Konteks anggota dan jurnal approved untuk laporan PKL kelompok';
