import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveAdmin,
  sendJson,
} from './_supabase.js';

const PHOTO_BUCKET = 'journal-photos';
const REASONS = {
  duplicate: 'Data jurnal duplikat',
  wrong_entry: 'Kesalahan tanggal atau isi jurnal',
  test_data: 'Data uji/dummy',
  student_request: 'Permintaan siswa',
  teacher_request: 'Permintaan guru pembimbing',
  inappropriate: 'Isi tidak sesuai ketentuan sekolah',
  other: 'Alasan lainnya',
};

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;
  try {
    const { admin, profile } = await requireActiveAdmin(req);
    const body = parseBody(req);
    const journalId = String(body.journal_id || '').trim();
    const reasonCode = String(body.reason_code || '').trim();
    const reasonDetail = String(body.reason_detail || '').trim();
    const confirmation = String(body.confirmation || '').trim();

    if (!journalId) return sendJson(res, 400, { error: 'ID jurnal wajib diisi.' });
    if (!REASONS[reasonCode]) return sendJson(res, 400, { error: 'Pilih alasan penghapusan yang tersedia.' });
    if (reasonDetail.length < 10 || reasonDetail.length > 1000) {
      return sendJson(res, 400, { error: 'Catatan administrator harus berisi 10–1000 karakter.' });
    }
    if (confirmation !== 'HAPUS') {
      return sendJson(res, 400, { error: 'Konfirmasi penghapusan tidak sesuai.' });
    }

    const { data: journal, error: findError } = await admin
      .from('daily_journals')
      .select('id,student_id,journal_date,activity_title,status,photo_paths')
      .eq('id', journalId)
      .maybeSingle();
    if (findError) throw findError;
    if (!journal) return sendJson(res, 404, { error: 'Jurnal tidak ditemukan atau sudah dihapus.' });

    const { error: deleteError } = await admin
      .from('daily_journals')
      .delete()
      .eq('id', journalId);
    if (deleteError) throw deleteError;

    const photoPaths = Array.isArray(journal.photo_paths) ? journal.photo_paths.filter(Boolean) : [];
    let warning = '';
    if (photoPaths.length) {
      const { error: storageError } = await admin.storage.from(PHOTO_BUCKET).remove(photoPaths);
      if (storageError) warning = 'Jurnal terhapus, tetapi sebagian foto dokumentasi gagal dibersihkan dari penyimpanan.';
    }

    console.info('ADMIN_JOURNAL_DELETE', {
      administrator_id: profile.id,
      administrator_name: profile.full_name,
      journal_id: journal.id,
      student_id: journal.student_id,
      journal_status: journal.status,
      reason_code: reasonCode,
      reason_label: REASONS[reasonCode],
      reason_detail: reasonDetail,
      deleted_at: new Date().toISOString(),
    });

    return sendJson(res, 200, {
      success: true,
      message: 'Jurnal berhasil dihapus permanen oleh administrator.',
      warning: warning || undefined,
      journal_id: journal.id,
      previous_status: journal.status,
    });
  } catch (error) {
    console.error('admin-delete-journal error:', error);
    return sendJson(res, Number(error?.statusCode || 500), { error: publicError(error) });
  }
}
