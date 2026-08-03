import { createHash } from 'node:crypto';
import {
  allowPostOnly,
  clients,
  parseBody,
  publicError,
  sendJson,
} from './_supabase.js';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function getInvite(admin, tokenHash) {
  const { data, error } = await admin
    .from('student_registration_invites')
    .select('*')
    .eq('token_hash', tokenHash)
    .single();
  if (error || !data) {
    const invalid = new Error('Link pendaftaran tidak valid atau tidak ditemukan.');
    invalid.statusCode = 404;
    throw invalid;
  }
  if (data.status !== 'available') {
    const used = new Error(data.status === 'used'
      ? 'Link pendaftaran sudah pernah digunakan.'
      : 'Link pendaftaran tidak dapat digunakan.');
    used.statusCode = 409;
    throw used;
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    const expired = new Error('Link pendaftaran sudah kedaluwarsa. Hubungi administrator untuk meminta link baru.');
    expired.statusCode = 410;
    throw expired;
  }
  return data;
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  let admin;
  let createdUserId = null;
  let reservedInviteId = null;

  try {
    const body = parseBody(req);
    const action = String(body.action || 'info');
    const token = String(body.token || '').trim();
    if (token.length < 20) return sendJson(res, 400, { error: 'Token pendaftaran tidak valid.' });

    ({ admin } = clients());
    const tokenHash = hashToken(token);

    if (action === 'info') {
      const invite = await getInvite(admin, tokenHash);
      return sendJson(res, 200, {
        ok: true,
        invite: {
          full_name: invite.full_name,
          nis: invite.nis,
          class_name: invite.class_name,
          internship_place: invite.internship_place,
          expires_at: invite.expires_at,
        },
      });
    }

    if (action !== 'register') return sendJson(res, 400, { error: 'Aksi pendaftaran tidak valid.' });

    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(res, 400, { error: 'Format email tidak valid.' });
    if (password.length < 8) return sendJson(res, 400, { error: 'Password minimal 8 karakter.' });
    if (phone.length > 30) return sendJson(res, 400, { error: 'Nomor HP terlalu panjang.' });

    const invite = await getInvite(admin, tokenHash);
    const { data: reserved, error: reserveError } = await admin
      .from('student_registration_invites')
      .update({ status: 'processing' })
      .eq('id', invite.id)
      .eq('status', 'available')
      .select('id')
      .single();
    if (reserveError || !reserved) return sendJson(res, 409, { error: 'Link sedang digunakan atau sudah tidak tersedia.' });
    reservedInviteId = invite.id;

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: invite.full_name,
        role: 'student',
        phone: phone || null,
        registration_method: 'invite',
      },
    });
    if (createError || !created?.user) throw createError || new Error('Akun autentikasi gagal dibuat.');
    createdUserId = created.user.id;

    // Blokir login pada lapisan autentikasi sampai administrator menyetujui.
    const { error: banError } = await admin.auth.admin.updateUserById(createdUserId, {
      ban_duration: '876000h',
    });
    if (banError) throw new Error(`Akun gagal dikunci untuk verifikasi: ${banError.message}`);

    const { error: profileError } = await admin.from('profiles').upsert({
      id: createdUserId,
      full_name: invite.full_name,
      email,
      phone: phone || null,
      role: 'student',
      is_active: false,
      registration_status: 'pending',
    }, { onConflict: 'id' });
    if (profileError) throw new Error(`Profil siswa gagal dibuat: ${profileError.message}`);

    const { error: detailError } = await admin.from('student_details').upsert({
      id: createdUserId,
      nis: invite.nis,
      class_name: invite.class_name,
      internship_place: invite.internship_place,
      teacher_id: invite.teacher_id || null,
      field_supervisor_id: invite.field_supervisor_id || null,
      start_date: invite.start_date || null,
      end_date: invite.end_date || null,
    }, { onConflict: 'id' });
    if (detailError) throw new Error(`Data siswa gagal disimpan: ${detailError.message}`);

    const { error: inviteError } = await admin.from('student_registration_invites').update({
      status: 'used',
      used_by: createdUserId,
      used_at: new Date().toISOString(),
    }).eq('id', invite.id);
    if (inviteError) throw inviteError;

    return sendJson(res, 201, {
      ok: true,
      message: 'Pendaftaran berhasil dan menunggu verifikasi administrator.',
    });
  } catch (error) {
    if (createdUserId && admin) {
      await admin.auth.admin.deleteUser(createdUserId).catch(() => {});
    }
    if (reservedInviteId && admin) {
      await admin.from('student_registration_invites')
        .update({ status: 'available' })
        .eq('id', reservedInviteId)
        .eq('status', 'processing');
    }
    console.error('register-student:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
