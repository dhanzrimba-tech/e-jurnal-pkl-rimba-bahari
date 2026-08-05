import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveAdmin,
  sendJson,
} from './_supabase.js';

const PHOTO_BUCKET = 'journal-photos';

function collectPhotoPaths(attendance) {
  return [...new Set([
    attendance?.check_in_photo_path,
    attendance?.check_out_photo_path,
    ...(Array.isArray(attendance?.photo_paths) ? attendance.photo_paths : []),
  ].filter(Boolean))];
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const { admin } = await requireActiveAdmin(req);
    const body = parseBody(req);
    const attendanceId = String(body.attendance_id || '').trim();
    const confirmation = String(body.confirmation || '').trim();

    if (!attendanceId) return sendJson(res, 400, { error: 'ID presensi wajib diisi.' });
    if (confirmation !== 'HAPUS') {
      return sendJson(res, 400, { error: 'Konfirmasi penghapusan tidak sesuai.' });
    }

    const { data: attendance, error: findError } = await admin
      .from('attendance')
      .select('id,student_id,attendance_date,check_in_photo_path,check_out_photo_path,photo_paths')
      .eq('id', attendanceId)
      .maybeSingle();

    if (findError) throw findError;
    if (!attendance) return sendJson(res, 404, { error: 'Data presensi tidak ditemukan atau sudah dihapus.' });

    const { error: deleteError } = await admin
      .from('attendance')
      .delete()
      .eq('id', attendanceId);
    if (deleteError) throw deleteError;

    const photoPaths = collectPhotoPaths(attendance);
    let warning = '';
    if (photoPaths.length) {
      const { error: storageError } = await admin.storage.from(PHOTO_BUCKET).remove(photoPaths);
      if (storageError) warning = 'Presensi terhapus, tetapi sebagian foto selfie gagal dibersihkan dari penyimpanan.';
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Presensi siswa berhasil dihapus permanen.',
      warning: warning || undefined,
      attendance_id: attendance.id,
    });
  } catch (error) {
    console.error('delete-attendance error:', error);
    return sendJson(res, Number(error?.statusCode || 500), { error: publicError(error) });
  }
}
