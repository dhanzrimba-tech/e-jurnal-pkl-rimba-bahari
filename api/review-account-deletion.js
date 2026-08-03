import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveAdmin,
  sendJson,
} from './_supabase.js';

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isOptionalRelationError(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || '').toLowerCase();
  return ['42P01', 'PGRST205'].includes(code)
    || message.includes('could not find the table')
    || message.includes('does not exist');
}

async function optionalOperation(label, operation) {
  const result = await operation();
  if (result?.error && !isOptionalRelationError(result.error)) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result;
}

async function deleteUserData(admin, target) {
  let photoWarning = null;

  const { data: journals, error: journalReadError } = await admin
    .from('daily_journals')
    .select('id,photo_paths')
    .eq('student_id', target.id);
  if (journalReadError) throw new Error(`Gagal membaca jurnal pengguna: ${journalReadError.message}`);

  const photoPaths = (journals || []).flatMap((journal) =>
    Array.isArray(journal.photo_paths) ? journal.photo_paths : []);
  if (photoPaths.length) {
    const { error: storageError } = await admin.storage.from('journal-photos').remove(photoPaths);
    if (storageError) {
      console.error('review-account-deletion photo cleanup:', storageError);
      photoWarning = 'Akun sudah dihapus, tetapi sebagian foto mungkin masih perlu dibersihkan dari Storage.';
    }
  }

  await optionalOperation('Gagal melepaskan guru pembimbing', () => admin
    .from('student_details').update({ teacher_id: null }).eq('teacher_id', target.id));
  await optionalOperation('Gagal melepaskan pembimbing lapangan', () => admin
    .from('student_details').update({ field_supervisor_id: null }).eq('field_supervisor_id', target.id));
  await optionalOperation('Gagal membersihkan validator jurnal', () => admin
    .from('daily_journals').update({ validated_by: null }).eq('validated_by', target.id));

  await optionalOperation('Gagal membersihkan permintaan penghapusan jurnal', () => admin
    .from('journal_deletion_requests')
    .delete()
    .or(`student_id.eq.${target.id},teacher_id.eq.${target.id},requested_by.eq.${target.id},reviewed_by.eq.${target.id}`));

  if (target.role === 'student') {
    await optionalOperation('Gagal menghapus presensi siswa', () => admin
      .from('attendance').delete().eq('student_id', target.id));
    await optionalOperation('Gagal menghapus jurnal siswa', () => admin
      .from('daily_journals').delete().eq('student_id', target.id));
    await optionalOperation('Gagal menghapus data siswa', () => admin
      .from('student_details').delete().eq('id', target.id));
  }

  let authDelete = await admin.auth.admin.deleteUser(target.id);
  if (authDelete.error) {
    const { error: profileDeleteError } = await admin.from('profiles').delete().eq('id', target.id);
    if (profileDeleteError) {
      throw new Error(`Akun gagal dihapus: ${authDelete.error.message}; profil juga gagal dibersihkan: ${profileDeleteError.message}`);
    }
    authDelete = await admin.auth.admin.deleteUser(target.id);
    if (authDelete.error) throw authDelete.error;
  } else {
    const { error: profileDeleteError } = await admin.from('profiles').delete().eq('id', target.id);
    if (profileDeleteError && !isOptionalRelationError(profileDeleteError)) {
      throw new Error(`Akun Auth sudah dihapus, tetapi profil gagal dibersihkan: ${profileDeleteError.message}`);
    }
  }

  return photoWarning;
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const body = parseBody(req);
    const requestId = String(body.request_id || '').trim();
    const decision = String(body.decision || '').trim().toLowerCase();
    const reviewNote = String(body.review_note || '').trim();
    const confirmation = String(body.confirmation || '').trim();

    if (!validUuid(requestId)) return sendJson(res, 400, { error: 'ID permintaan tidak valid.' });
    if (!['approved', 'rejected'].includes(decision)) {
      return sendJson(res, 400, { error: 'Keputusan tidak valid.' });
    }
    if (reviewNote.length < 5) return sendJson(res, 400, { error: 'Catatan keputusan minimal 5 karakter.' });
    if (reviewNote.length > 1000) return sendJson(res, 400, { error: 'Catatan keputusan maksimal 1000 karakter.' });
    if (decision === 'approved' && confirmation !== 'SETUJUI') {
      return sendJson(res, 400, { error: 'Ketik SETUJUI untuk mengonfirmasi penghapusan permanen.' });
    }

    const { admin, actor, profile: adminProfile } = await requireActiveAdmin(req);

    const { data: request, error: requestError } = await admin
      .from('account_deletion_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) return sendJson(res, 404, { error: 'Permintaan penghapusan akun tidak ditemukan.' });
    if (request.status !== 'pending') {
      return sendJson(res, 409, { error: 'Permintaan ini sudah pernah diproses.' });
    }

    if (decision === 'rejected') {
      const { error: rejectError } = await admin
        .from('account_deletion_requests')
        .update({
          status: 'rejected',
          review_note: reviewNote,
          reviewed_by: actor.id,
          reviewed_by_name: adminProfile.full_name || 'Administrator',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('status', 'pending');
      if (rejectError) throw rejectError;

      return sendJson(res, 200, {
        ok: true,
        status: 'rejected',
        message: 'Permintaan penghapusan akun ditolak.',
      });
    }

    const targetId = String(request.target_user_id || '').trim();
    if (!validUuid(targetId)) {
      return sendJson(res, 409, { error: 'Akun tujuan sudah tidak tersedia atau telah dihapus.' });
    }
    if (targetId === actor.id) {
      return sendJson(res, 403, { error: 'Administrator yang sedang login tidak dapat menghapus akunnya sendiri.' });
    }

    const { data: target, error: targetError } = await admin
      .from('profiles')
      .select('id,full_name,email,role,is_active')
      .eq('id', targetId)
      .single();
    if (targetError || !target) return sendJson(res, 404, { error: 'Akun pengguna tidak ditemukan.' });
    if (target.role === 'admin') {
      return sendJson(res, 403, { error: 'Akun administrator dilindungi dan tidak dapat dihapus.' });
    }

    const warning = await deleteUserData(admin, target);

    const { error: approveError } = await admin
      .from('account_deletion_requests')
      .update({
        status: 'approved',
        review_note: reviewNote,
        reviewed_by: actor.id,
        reviewed_by_name: adminProfile.full_name || 'Administrator',
        reviewed_at: new Date().toISOString(),
        deleted_at: new Date().toISOString(),
        warning,
      })
      .eq('id', requestId)
      .eq('status', 'pending');
    if (approveError) throw new Error(`Akun sudah dihapus, tetapi riwayat persetujuan gagal diperbarui: ${approveError.message}`);

    return sendJson(res, 200, {
      ok: true,
      status: 'approved',
      deleted_user: {
        id: target.id,
        full_name: target.full_name,
        email: target.email,
        role: target.role,
      },
      warning,
      message: 'Permintaan disetujui dan akun berhasil dihapus permanen.',
    });
  } catch (error) {
    console.error('review-account-deletion:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
