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
    if (!/^[0-9a-f-]{36}$/i.test(userId)) return sendJson(res, 400, { error: 'ID siswa tidak valid.' });

    const { admin, actor } = await requireActiveAdmin(req);
    const { data: profile, error: findError } = await admin.from('profiles')
      .select('id,role,registration_status')
      .eq('id', userId)
      .single();
    if (findError || !profile) return sendJson(res, 404, { error: 'Profil siswa tidak ditemukan.' });
    if (profile.role !== 'student') return sendJson(res, 400, { error: 'Pengguna tersebut bukan siswa.' });

    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      ban_duration: 'none',
    });
    if (authError) throw new Error(`Akun autentikasi gagal diaktifkan: ${authError.message}`);

    const { error } = await admin.from('profiles').update({
      is_active: true,
      registration_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: actor.id,
    }).eq('id', userId);
    if (error) {
      // Kunci kembali bila profil gagal diaktifkan agar status Auth dan profil tetap konsisten.
      await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' }).catch(() => {});
      throw error;
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('verify-registration:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
