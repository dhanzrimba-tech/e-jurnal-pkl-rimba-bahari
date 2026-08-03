import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveAdmin,
  sendJson,
} from './_supabase.js';

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const body = parseBody(req);
    const userId = String(body.user_id || '').trim();
    const newPassword = String(body.new_password || '');

    if (!/^[0-9a-f-]{36}$/i.test(userId)) {
      return sendJson(res, 400, { error: 'ID pengguna tidak valid.' });
    }
    if (newPassword.length < 8) {
      return sendJson(res, 400, { error: 'Password baru minimal 8 karakter.' });
    }

    const { admin } = await requireActiveAdmin(req);
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) throw error;

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('reset-password:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
