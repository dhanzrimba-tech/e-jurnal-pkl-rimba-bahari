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

async function writeDeletionAudit(admin, actor, adminProfile, target, reason, warning) {
  try {
    // Tutup permintaan lama yang mungkin masih berstatus pending dari versi sebelumnya.
    const pendingResult = await admin.from('account_deletion_requests')
      .update({
        status: 'canceled',
        review_note: 'Dibatalkan otomatis karena administrator menggunakan penghapusan langsung.',
        reviewed_by: actor.id,
        reviewed_by_name: adminProfile.full_name || 'Administrator',
        reviewed_at: new Date().toISOString(),
      })
      .eq('target_user_id', target.id)
      .eq('status', 'pending');
    if (pendingResult.error && !isOptionalRelationError(pendingResult.error)) {
      console.error('delete-user cancel old request:', pendingResult.error);
    }

    const auditResult = await admin.from('account_deletion_requests').insert({
      target_user_id: null,
      target_full_name: target.full_name,
      target_email: target.email,
      target_role: target.role,
      reason,
      status: 'approved',
      requested_by: actor.id,
      requested_by_name: adminProfile.full_name || 'Administrator',
      requested_at: new Date().toISOString(),
      review_note: 'Dihapus langsung oleh administrator tanpa tahap pengajuan terpisah.',
      reviewed_by: actor.id,
      reviewed_by_name: adminProfile.full_name || 'Administrator',
      reviewed_at: new Date().toISOString(),
      deleted_at: new Date().toISOString(),
      warning: warning || null,
    });
    if (auditResult.error && !isOptionalRelationError(auditResult.error)) {
      console.error('delete-user audit:', auditResult.error);
      return 'Akun berhasil dihapus, tetapi riwayat audit gagal disimpan.';
    }
  } catch (error) {
    if (!isOptionalRelationError(error)) console.error('delete-user audit:', error);
    return isOptionalRelationError(error) ? null : 'Akun berhasil dihapus, tetapi riwayat audit gagal disimpan.';
  }
  return null;
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const body = parseBody(req);
    const targetId = String(body.user_id || '').trim();
    const confirmation = String(body.confirmation || '').trim();
    const reason = String(body.reason || '').trim();

    if (!validUuid(targetId)) return sendJson(res, 400, { error: 'ID pengguna tidak valid.' });
    if (confirmation !== 'HAPUS') return sendJson(res, 400, { error: 'Konfirmasi penghapusan tidak valid.' });
    if (reason.length < 10 || reason.length > 1000) {
      return sendJson(res, 400, { error: 'Alasan penghapusan wajib diisi antara 10 sampai 1000 karakter.' });
    }

    const { admin, actor, profile: adminProfile } = await requireActiveAdmin(req);
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

    let photoWarning = null;
    const { data: journals, error: journalReadError } = await admin
      .from('daily_journals')
      .select('id,photo_paths')
      .eq('student_id', targetId);
    if (journalReadError) throw new Error(`Gagal membaca jurnal pengguna: ${journalReadError.message}`);

    const photoPaths = (journals || []).flatMap((journal) =>
      Array.isArray(journal.photo_paths) ? journal.photo_paths : []);
    if (photoPaths.length) {
      const { error: storageError } = await admin.storage.from('journal-photos').remove(photoPaths);
      if (storageError) {
        console.error('delete-user photo cleanup:', storageError);
        photoWarning = 'Akun sudah dihapus, tetapi sebagian berkas foto mungkin masih perlu dibersihkan dari Storage.';
      }
    }

    await optionalOperation('Gagal melepaskan guru pembimbing', () => admin
      .from('student_details').update({ teacher_id: null }).eq('teacher_id', targetId));
    await optionalOperation('Gagal melepaskan pembimbing lapangan', () => admin
      .from('student_details').update({ field_supervisor_id: null }).eq('field_supervisor_id', targetId));
    await optionalOperation('Gagal membersihkan validator jurnal', () => admin
      .from('daily_journals').update({ validated_by: null }).eq('validated_by', targetId));

    await optionalOperation('Gagal membersihkan permintaan penghapusan jurnal', () => admin
      .from('journal_deletion_requests')
      .delete()
      .or(`student_id.eq.${targetId},teacher_id.eq.${targetId},requested_by.eq.${targetId},reviewed_by.eq.${targetId}`));

    if (target.role === 'student') {
      await optionalOperation('Gagal menghapus presensi siswa', () => admin
        .from('attendance').delete().eq('student_id', targetId));
      await optionalOperation('Gagal menghapus jurnal siswa', () => admin
        .from('daily_journals').delete().eq('student_id', targetId));
      await optionalOperation('Gagal menghapus data siswa', () => admin
        .from('student_details').delete().eq('id', targetId));
    }

    let authDelete = await admin.auth.admin.deleteUser(targetId);
    if (authDelete.error) {
      const { error: profileDeleteError } = await admin.from('profiles').delete().eq('id', targetId);
      if (profileDeleteError) {
        throw new Error(`Akun gagal dihapus: ${authDelete.error.message}; profil juga gagal dibersihkan: ${profileDeleteError.message}`);
      }
      authDelete = await admin.auth.admin.deleteUser(targetId);
      if (authDelete.error) throw authDelete.error;
    } else {
      const { error: profileDeleteError } = await admin.from('profiles').delete().eq('id', targetId);
      if (profileDeleteError && !isOptionalRelationError(profileDeleteError)) {
        throw new Error(`Akun Auth sudah dihapus, tetapi profil gagal dibersihkan: ${profileDeleteError.message}`);
      }
    }

    const auditWarning = await writeDeletionAudit(admin, actor, adminProfile, target, reason, photoWarning);
    const warnings = [photoWarning, auditWarning].filter(Boolean);

    console.info('delete-user-direct', {
      actor_id: actor.id,
      target_id: targetId,
      target_role: target.role,
      reason,
      deleted_at: new Date().toISOString(),
    });

    return sendJson(res, 200, {
      ok: true,
      message: `Akun ${target.full_name} berhasil dihapus permanen.`,
      deleted_user: {
        id: targetId,
        full_name: target.full_name,
        email: target.email,
        role: target.role,
      },
      warning: warnings.length ? warnings.join(' ') : null,
    });
  } catch (error) {
    console.error('delete-user:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
