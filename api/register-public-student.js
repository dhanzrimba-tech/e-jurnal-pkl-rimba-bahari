import {
  allowPostOnly,
  clients,
  parseBody,
  publicError,
  sendJson,
} from './_supabase.js';

function cleanText(value, maxLength = 200) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const registrationBuckets = globalThis.__ejurnalPublicRegistrationBuckets || new Map();
globalThis.__ejurnalPublicRegistrationBuckets = registrationBuckets;

function clientAddress(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown').trim();
}

function allowRegistrationAttempt(req, res) {
  const now = Date.now();
  const key = clientAddress(req);
  const recent = (registrationBuckets.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_REQUESTS) {
    const retrySeconds = Math.max(60, Math.ceil((RATE_WINDOW_MS - (now - recent[0])) / 1000));
    res.setHeader('Retry-After', String(retrySeconds));
    sendJson(res, 429, { error: 'Terlalu banyak percobaan pendaftaran. Coba lagi beberapa saat.' });
    return false;
  }
  recent.push(now);
  registrationBuckets.set(key, recent);
  if (registrationBuckets.size > 2000) {
    for (const [bucketKey, times] of registrationBuckets) {
      if (!times.some((time) => now - time < RATE_WINDOW_MS)) registrationBuckets.delete(bucketKey);
    }
  }
  return true;
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;
  if (!allowRegistrationAttempt(req, res)) return;

  let admin = null;
  let createdUserId = null;
  try {
    const body = parseBody(req);
    const startedAt = Number(body.form_started_at || 0);
    if (startedAt && Date.now() - startedAt < 2500) {
      return sendJson(res, 400, { error: 'Formulir dikirim terlalu cepat. Periksa kembali data lalu coba lagi.' });
    }

    // Honeypot: bot mendapat respons seolah-olah berhasil tanpa membuat akun.
    if (cleanText(body.website, 200)) {
      return sendJson(res, 201, { ok: true, message: 'Pendaftaran berhasil dikirim.' });
    }

    const fullName = cleanText(body.full_name, 120);
    const nis = cleanText(body.nis, 30);
    const className = cleanText(body.class_name, 50);
    const internshipPlace = cleanText(body.internship_place, 200) || 'Belum ditentukan';
    const email = cleanText(body.email, 160).toLowerCase();
    const phone = cleanText(body.phone, 30);
    const password = String(body.password || '');
    const activeStudentConfirmed = body.active_student_confirmed === true;

    if (fullName.length < 3) return sendJson(res, 400, { error: 'Nama lengkap minimal 3 karakter.' });
    if (nis.length < 3) return sendJson(res, 400, { error: 'NIS wajib diisi dengan benar.' });
    if (!className) return sendJson(res, 400, { error: 'Kelas wajib diisi.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(res, 400, { error: 'Format email tidak valid.' });
    if (password.length < 8 || password.length > 72) return sendJson(res, 400, { error: 'Password harus berisi 8–72 karakter.' });
    if (phone.length > 30) return sendJson(res, 400, { error: 'Nomor HP terlalu panjang.' });
    if (!activeStudentConfirmed) return sendJson(res, 400, { error: 'Pernyataan siswa aktif wajib dicentang.' });

    ({ admin } = clients());

    const [emailCheck, nisCheck] = await Promise.all([
      admin.from('profiles').select('id,registration_status').eq('email', email).limit(1).maybeSingle(),
      admin.from('student_details').select('id').eq('nis', nis).limit(1).maybeSingle(),
    ]);
    if (emailCheck.error) throw emailCheck.error;
    if (nisCheck.error) throw nisCheck.error;
    if (emailCheck.data) return sendJson(res, 409, { error: 'Email sudah terdaftar atau sedang menunggu verifikasi.' });
    if (nisCheck.data) return sendJson(res, 409, { error: 'NIS sudah terdaftar atau sedang menunggu verifikasi.' });

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        role: 'student',
        phone: phone || null,
        nis,
        class_name: className,
        registration_method: 'public_student_form',
      },
    });
    if (createError || !created?.user) throw createError || new Error('Akun autentikasi gagal dibuat.');
    createdUserId = created.user.id;

    const { error: banError } = await admin.auth.admin.updateUserById(createdUserId, {
      ban_duration: '876000h',
    });
    if (banError) throw new Error(`Akun gagal dikunci untuk verifikasi: ${banError.message}`);

    const { error: profileError } = await admin.from('profiles').upsert({
      id: createdUserId,
      full_name: fullName,
      email,
      phone: phone || null,
      role: 'student',
      is_active: false,
      registration_status: 'pending',
    }, { onConflict: 'id' });
    if (profileError) throw new Error(`Profil siswa gagal dibuat: ${profileError.message}`);

    const { error: detailError } = await admin.from('student_details').upsert({
      id: createdUserId,
      nis,
      class_name: className,
      internship_place: internshipPlace,
      teacher_id: null,
      field_supervisor_id: null,
      start_date: null,
      end_date: null,
    }, { onConflict: 'id' });
    if (detailError) throw new Error(`Data siswa gagal disimpan: ${detailError.message}`);

    return sendJson(res, 201, {
      ok: true,
      message: 'Pendaftaran berhasil dan menunggu verifikasi administrator.',
    });
  } catch (error) {
    if (createdUserId && admin) {
      await admin.auth.admin.deleteUser(createdUserId).catch(() => {});
    }
    console.error('register-public-student:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
