-- ================================================================
-- IZIN HAPUS JURNAL OLEH SISWA
-- Jalankan melalui Supabase Dashboard > SQL Editor.
-- Siswa hanya dapat menghapus jurnal miliknya yang berstatus:
-- draft, revision, atau rejected.
-- Jurnal submitted dan approved tidak dapat dihapus.
-- ================================================================

alter table public.daily_journals enable row level security;

drop policy if exists "student delete own removable journals" on public.daily_journals;
create policy "student delete own removable journals"
on public.daily_journals
for delete
to authenticated
using (
  student_id = auth.uid()
  and status in ('draft', 'revision', 'rejected')
  and public.is_active_student()
);

select
  'delete_journal_ready' as status,
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'daily_journals'
      and policyname = 'student delete own removable journals'
  ) as policy_ready;
