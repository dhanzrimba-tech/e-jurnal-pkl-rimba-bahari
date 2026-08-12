-- ================================================================
-- E-JURNAL PKL v6.18 - SELFIE ABSEN DATANG DAN PULANG
-- Jalankan melalui Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
-- Waktu resmi menggunakan server dan zona Asia/Jakarta.
-- ================================================================

alter table public.attendance
  add column if not exists check_in_photo_path text,
  add column if not exists check_out_photo_path text,
  add column if not exists check_in_captured_at timestamptz,
  add column if not exists check_out_captured_at timestamptz,
  add column if not exists check_out_location text,
  add column if not exists check_out_notes text;

-- Migrasi foto lama agar tetap dikenali sebagai selfie datang/pulang.
update public.attendance
set check_in_photo_path = photo_paths[1]
where check_in_photo_path is null
  and coalesce(array_length(photo_paths,1),0) >= 1;

update public.attendance
set check_out_photo_path = photo_paths[2]
where check_out_photo_path is null
  and coalesce(array_length(photo_paths,1),0) >= 2;

update public.attendance
set check_in_captured_at = (attendance_date + check_in) at time zone 'Asia/Jakarta'
where check_in_captured_at is null and check_in is not null;

update public.attendance
set check_out_captured_at = (attendance_date + check_out) at time zone 'Asia/Jakarta'
where check_out_captured_at is null and check_out is not null;

create or replace function public.apply_attendance_selfie_timestamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jakarta_now timestamp := timezone('Asia/Jakarta', now());
begin
  -- Selfie datang pertama kali: lokasi dan catatan wajib, jam ditentukan server.
  if new.check_in_photo_path is not null
     and (tg_op = 'INSERT' or old.check_in_photo_path is null) then
    if length(trim(coalesce(new.location,''))) < 3 then
      raise exception 'Lokasi datang wajib diisi minimal 3 karakter.';
    end if;
    if length(trim(coalesce(new.notes,''))) < 3 then
      raise exception 'Catatan datang wajib diisi minimal 3 karakter.';
    end if;
    new.attendance_date := jakarta_now::date;
    new.check_in_captured_at := now();
    new.check_in := jakarta_now::time;
    new.presence_status := 'Hadir';
  elsif tg_op = 'UPDATE' then
    new.check_in_captured_at := old.check_in_captured_at;
    new.check_in := old.check_in;
  end if;

  -- Selfie pulang pertama kali: harus sudah datang, lokasi dan catatan pulang wajib.
  if new.check_out_photo_path is not null
     and (tg_op = 'INSERT' or old.check_out_photo_path is null) then
    if new.check_in_photo_path is null then
      raise exception 'Selfie datang belum tersedia.';
    end if;
    if length(trim(coalesce(new.check_out_location,''))) < 3 then
      raise exception 'Lokasi pulang wajib diisi minimal 3 karakter.';
    end if;
    if length(trim(coalesce(new.check_out_notes,''))) < 3 then
      raise exception 'Catatan pulang wajib diisi minimal 3 karakter.';
    end if;
    new.check_out_captured_at := now();
    new.check_out := jakarta_now::time;
  elsif tg_op = 'UPDATE' then
    new.check_out_captured_at := old.check_out_captured_at;
    new.check_out := old.check_out;
  end if;

  new.photo_paths := array_remove(array[new.check_in_photo_path,new.check_out_photo_path], null);
  return new;
end;
$$;

drop trigger if exists attendance_selfie_timestamp_trigger on public.attendance;
create trigger attendance_selfie_timestamp_trigger
before insert or update on public.attendance
for each row execute function public.apply_attendance_selfie_timestamp();

select
  'attendance_selfie_ready' as status,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='attendance' and column_name='check_in_photo_path') as check_in_photo_ready,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='attendance' and column_name='check_out_photo_path') as check_out_photo_ready,
  exists(select 1 from pg_trigger where tgname='attendance_selfie_timestamp_trigger') as timestamp_trigger_ready;
