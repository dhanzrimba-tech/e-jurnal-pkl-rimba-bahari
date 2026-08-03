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

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const body = parseBody(req);
    const targetId = String(body.user_id || '').trim();
    const reason = String(body.reason || '').trim();

    if (!validUuid(targetId)) return sendJson(res, 400, { error: 'ID pengguna tidak valid.' });
    if (reason.length < 10) return sendJson(res, 400, { error: 'Alasan penghapusan minimal 10 karakter.' });
    if (reason.length > 1000) return sendJson(res, 400, { error: 'Alasan penghapusan maksimal 1000 karakter.' });

    const { admin, actor, profile: adminProfile } = await requireActiveAdmin(req);
    if (targetId === actor.id) {
      return sendJson(res, 403, { error: 'Administrator tidak dapat mengajukan penghapusan akun dirinya sendiri.' });
    }

    const { data: target, error: targetError } = await admin
      .from('profiles')
      .select('id,full_name,email,role,is_active')
      .eq('id', targetId)
      .single();

    if (targetError || !target) return sendJson(res, 404, { error: 'Akun pengguna tidak ditemukan.' });
    if (target.role === 'admin') {
      return sendJson(res, 403, { error: 'Akun administrator dilindungi dan tidak dapat diajukan untuk dihapus.' });
    }

    const { data: existing, error: existingError } = await admin
      .from('account_deletion_requests')
      .select('id')
      .eq('target_user_id', targetId)
      .eq('status', 'pending')
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return sendJson(res, 409, { error: 'Akun ini sudah memiliki permintaan penghapusan yang menunggu persetujuan.' });
    }

    const { data: request, error: insertError } = await admin
      .from('account_deletion_requests')
      .insert({
        target_user_id: target.id,
        target_full_name: target.full_name,
        target_email: target.email,
        target_role: target.role,
        reason,
        status: 'pending',
        requested_by: actor.id,
        requested_by_name: adminProfile.full_name || 'Administrator',
      })
      .select('id,status,requested_at')
      .single();

    if (insertError) throw insertError;

    return sendJson(res, 201, {
      ok: true,
      request,
      message: 'Permintaan penghapusan sudah dibuat dan menunggu persetujuan administrator.',
    });
  } catch (error) {
    console.error('request-account-deletion:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
