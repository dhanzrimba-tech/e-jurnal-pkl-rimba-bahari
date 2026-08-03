import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveAdmin,
  sendJson,
} from './_supabase.js';

const ALLOWED_ROLES = new Set(['admin', 'student', 'teacher', 'field_supervisor']);

function validateInput(body) {
  const fullName = String(body.full_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const role = String(body.role || '').trim();
  const phone = String(body.phone || '').trim();

  if (fullName.length < 2) throw Object.assign(new Error('Nama lengkap minimal 2 karakter.'), { statusCode: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Format email tidak valid.'), { statusCode: 400 });
  if (password.length < 8) throw Object.assign(new Error('Password awal minimal 8 karakter.'), { statusCode: 400 });
  if (!ALLOWED_ROLES.has(role)) throw Object.assign(new Error('Peran pengguna tidak valid.'), { statusCode: 400 });
  if (phone.length > 30) throw Object.assign(new Error('Nomor HP terlalu panjang.'), { statusCode: 400 });

  return { fullName, email, password, role, phone };
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  let createdUserId = null;
  let admin = null;

  try {
    const input = validateInput(parseBody(req));
    const access = await requireActiveAdmin(req);
    admin = access.admin;

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        role: input.role,
        phone: input.phone || null,
      },
    });

    if (createError || !created?.user) throw createError || new Error('Akun autentikasi gagal dibuat.');
    createdUserId = created.user.id;

    const profile = {
      id: createdUserId,
      full_name: input.fullName,
      email: input.email,
      role: input.role,
      is_active: true,
      registration_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: access.actor.id,
    };
    if (input.phone) profile.phone = input.phone;

    let profileResult = await admin
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    // Tetap kompatibel bila tabel profiles versi lama belum memiliki kolom phone.
    if (profileResult.error && input.phone && /phone/i.test(profileResult.error.message || '')) {
      delete profile.phone;
      profileResult = await admin
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });
    }

    if (profileResult.error) throw new Error(`Akun dibuat, tetapi profil gagal disimpan: ${profileResult.error.message}`);

    return sendJson(res, 201, {
      ok: true,
      user: {
        id: createdUserId,
        email: input.email,
        full_name: input.fullName,
        role: input.role,
      },
    });
  } catch (error) {
    // Jangan meninggalkan akun Auth tanpa baris profiles.
    if (createdUserId && admin) {
      await admin.auth.admin.deleteUser(createdUserId).catch(() => {});
    }

    console.error('create-user:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
