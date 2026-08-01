-- E-Jurnal PKL SMK Kehutanan Rimba Bahari Sumedang
-- Jalankan seluruh skrip ini pada Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('admin','student','teacher','field_supervisor')),
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_details (
  id uuid primary key references public.profiles(id) on delete cascade,
  nis text not null unique,
  class_name text not null default 'XI',
  internship_place text not null,
  teacher_id uuid references public.profiles(id) on delete set null,
  field_supervisor_id uuid references public.profiles(id) on delete set null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_journals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  journal_date date not null,
  work_hours numeric(4,1) not null default 0,
  location text not null,
  weather text,
  activity_title text not null,
  description text not null,
  activity_stages text[] not null default '{}',
  learning text,
  obstacles text,
  reflection text,
  status text not null default 'draft' check (status in ('draft','submitted','approved','revision','rejected')),
  supervisor_note text,
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id,journal_date)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  attendance_date date not null,
  check_in time,
  check_out time,
  presence_status text not null default 'Hadir',
  location text,
  notes text,
  validated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(student_id,attendance_date)
);

create table if not exists public.final_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.profiles(id) on delete cascade,
  attitude_score numeric(5,2) default 0,
  knowledge_score numeric(5,2) default 0,
  skill_score numeric(5,2) default 0,
  final_score numeric(5,2) generated always as ((attitude_score*0.30)+(knowledge_score*0.30)+(skill_score*0.40)) stored,
  notes text,
  assessor_id uuid references public.profiles(id),
  assessed_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name,email,role,phone)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name','Pengguna'),new.email,
    coalesce(new.raw_user_meta_data->>'role','student'),new.raw_user_meta_data->>'phone')
  on conflict(id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and is_active=true);
$$;
create or replace function public.my_role() returns text language sql stable security definer set search_path=public as $$
  select role from public.profiles where id=auth.uid();
$$;
create or replace function public.can_access_student(sid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select public.is_admin() or sid=auth.uid() or exists(
   select 1 from public.student_details sd where sd.id=sid and (sd.teacher_id=auth.uid() or sd.field_supervisor_id=auth.uid())
 );
$$;

alter table public.profiles enable row level security;
alter table public.student_details enable row level security;
alter table public.daily_journals enable row level security;
alter table public.attendance enable row level security;
alter table public.final_assessments enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_read_authenticated" on public.profiles for select to authenticated using (true);
create policy "profiles_admin_update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "student_details_read" on public.student_details for select to authenticated using (public.can_access_student(id));
create policy "student_details_admin_insert" on public.student_details for insert to authenticated with check (public.is_admin());
create policy "student_details_admin_update" on public.student_details for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "student_details_admin_delete" on public.student_details for delete to authenticated using (public.is_admin());

create policy "journals_read" on public.daily_journals for select to authenticated using (public.can_access_student(student_id));
create policy "journals_student_insert" on public.daily_journals for insert to authenticated with check (student_id=auth.uid() and public.my_role()='student');
create policy "journals_student_update" on public.daily_journals for update to authenticated using (student_id=auth.uid() and status in ('draft','revision')) with check (student_id=auth.uid());
create policy "journals_supervisor_update" on public.daily_journals for update to authenticated using (public.can_access_student(student_id) and public.my_role() in ('teacher','field_supervisor','admin')) with check (public.can_access_student(student_id));
create policy "journals_admin_delete" on public.daily_journals for delete to authenticated using (public.is_admin());

create policy "attendance_read" on public.attendance for select to authenticated using (public.can_access_student(student_id));
create policy "attendance_student_insert" on public.attendance for insert to authenticated with check (student_id=auth.uid());
create policy "attendance_student_update" on public.attendance for update to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());
create policy "attendance_supervisor_update" on public.attendance for update to authenticated using (public.can_access_student(student_id) and public.my_role() in ('teacher','field_supervisor','admin')) with check (public.can_access_student(student_id));

create policy "assessment_read" on public.final_assessments for select to authenticated using (public.can_access_student(student_id));
create policy "assessment_upsert" on public.final_assessments for all to authenticated using (public.can_access_student(student_id) and public.my_role() in ('field_supervisor','teacher','admin')) with check (public.can_access_student(student_id));
create policy "audit_admin_read" on public.audit_logs for select to authenticated using (public.is_admin());

-- Setelah membuat akun administrator pertama di menu Authentication > Users,
-- jalankan perintah berikut dengan mengganti UUID dan email:
-- insert into public.profiles(id,full_name,email,role,is_active)
-- values('UUID_ADMIN','Administrator Sekolah','admin@rimbabahari.sch.id','admin',true)
-- on conflict(id) do update set role='admin',full_name=excluded.full_name;
