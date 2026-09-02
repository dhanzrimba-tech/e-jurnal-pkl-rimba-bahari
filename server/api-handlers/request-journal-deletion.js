import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveUser,
  sendJson,
} from './_supabase.js';

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const body = parseBody(req);
    const journalId = String(body.journal_id || '').trim();
    const reason = String(body.reason || '').trim();

    if (!validUuid(journalId)) return sendJson(res, 400, { error: 'ID jurnal tidak valid.' });
    if (reason.length < 10) return sendJson(res, 400, { error: 'Alasan penghapusan minimal 10 karakter.' });
    if (reason.length > 1000) return sendJson(res, 400, { error: 'Alasan penghapusan maksimal 1000 karakter.' });

    const { admin, actor } = await requireActiveUser(req, ['student']);

    const { data: journal, error: journalError } = await admin
      .from('daily_journals')
      .select('id,student_id,status,journal_date,activity_title,description,photo_paths')
      .eq('id', journalId)
      .single();
    if (journalError) return sendJson(res, 400, { error: publicError(journalError) });
    if (!journal) return sendJson(res, 404, { error: 'Jurnal tidak ditemukan.' });
    if (journal.student_id !== actor.id) return sendJson(res, 403, { error: 'Jurnal ini bukan milik Anda.' });
    if (journal.status !== 'approved') {
      return sendJson(res, 409, { error: 'Permintaan persetujuan hanya berlaku untuk jurnal yang sudah disetujui.' });
    }

    const { data: details, error: detailsError } = await admin
      .from('student_details')
      .select('teacher_id')
      .eq('id', actor.id)
      .maybeSingle();
    if (detailsError) return sendJson(res, 400, { error: publicError(detailsError) });
    if (!details?.teacher_id) {
      return sendJson(res, 409, { error: 'Guru pembimbing belum ditetapkan. Administrator harus melengkapinya pada menu Data Siswa.' });
    }

    const { data: teacher, error: teacherError } = await admin
      .from('profiles')
      .select('id,role,is_active,full_name')
      .eq('id', details.teacher_id)
      .maybeSingle();
    if (teacherError) return sendJson(res, 400, { error: publicError(teacherError) });
    if (!teacher || teacher.role !== 'teacher' || teacher.is_active === false) {
      return sendJson(res, 409, { error: 'Guru pembimbing pada data siswa tidak valid atau tidak aktif. Administrator perlu memperbarui penugasan guru.' });
    }

    const { data: existing, error: existingError } = await admin
      .from('journal_deletion_requests')
      .select('id,status')
      .eq('journal_id', journalId)
      .eq('status', 'pending')
      .maybeSingle();
    if (existingError) return sendJson(res, 400, { error: publicError(existingError) });
    if (existing) return sendJson(res, 409, { error: 'Permintaan penghapusan jurnal ini masih menunggu keputusan guru.' });

    const { data: created, error: insertError } = await admin
      .from('journal_deletion_requests')
      .insert({
        journal_id: journal.id,
        student_id: actor.id,
        teacher_id: details.teacher_id,
        journal_date: journal.journal_date,
        activity_title: journal.activity_title,
        journal_description: journal.description || null,
        photo_paths: journal.photo_paths || [],
        reason,
        status: 'pending',
        requested_by: actor.id,
      })
      .select('id,status,requested_at')
      .single();
    if (insertError) {
      return sendJson(res, 400, {
        error: publicError(insertError),
        error_code: String(insertError.code || ''),
      });
    }

    return sendJson(res, 201, {
      ok: true,
      message: 'Permintaan penghapusan berhasil dikirim kepada guru pembimbing.',
      request: created,
    });
  } catch (error) {
    console.error('request-journal-deletion:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
