import { createClient } from '@supabase/supabase-js';

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

export function getEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Konfigurasi server belum lengkap: ${missing.join(', ')}`);
    error.statusCode = 500;
    throw error;
  }

  return {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function sendJson(res, status, payload) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.json(payload);
}

export function allowPostOnly(req, res) {
  if (req.method === 'POST') return true;
  res.setHeader('Allow', 'POST');
  sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  return false;
}

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      const error = new Error('Format data permintaan tidak valid.');
      error.statusCode = 400;
      throw error;
    }
  }
  return req.body;
}

export function bearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    const error = new Error('Sesi login tidak ditemukan. Silakan masuk kembali.');
    error.statusCode = 401;
    throw error;
  }
  return match[1];
}

export function clients() {
  const env = getEnv();
  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };

  return {
    anon: createClient(env.url, env.anonKey, options),
    admin: createClient(env.url, env.serviceRoleKey, options),
  };
}

export async function requireActiveUser(req, allowedRoles = []) {
  const token = bearerToken(req);
  const { anon, admin } = clients();

  const { data: authData, error: authError } = await anon.auth.getUser(token);
  if (authError || !authData?.user) {
    const error = new Error('Sesi sudah tidak valid. Silakan masuk kembali.');
    error.statusCode = 401;
    throw error;
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, role, is_active, full_name')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    const error = new Error('Profil pengguna tidak ditemukan.');
    error.statusCode = 403;
    throw error;
  }
  if (profile.is_active === false) {
    const error = new Error('Akun pengguna sedang tidak aktif.');
    error.statusCode = 403;
    throw error;
  }
  if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
    const error = new Error('Anda tidak memiliki izin untuk melakukan tindakan ini.');
    error.statusCode = 403;
    throw error;
  }

  return { admin, actor: authData.user, profile };
}

export async function requireActiveAdmin(req) {
  const token = bearerToken(req);
  const { anon, admin } = clients();

  const { data: authData, error: authError } = await anon.auth.getUser(token);
  if (authError || !authData?.user) {
    const error = new Error('Sesi sudah tidak valid. Silakan masuk kembali.');
    error.statusCode = 401;
    throw error;
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, role, is_active, full_name')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    const error = new Error('Profil administrator tidak ditemukan.');
    error.statusCode = 403;
    throw error;
  }

  if (profile.role !== 'admin' || profile.is_active === false) {
    const error = new Error('Hanya administrator aktif yang dapat melakukan tindakan ini.');
    error.statusCode = 403;
    throw error;
  }

  return { admin, actor: authData.user, profile };
}

export function publicError(error) {
  const raw = error?.message ?? error?.error_description ?? error?.details ?? error?.hint ?? error?.error ?? error;
  let message = 'Terjadi kesalahan pada server.';
  if (typeof raw === 'string' && raw.trim()) message = raw.trim();
  else if (raw && typeof raw === 'object') {
    try { message = JSON.stringify(raw); } catch { message = 'Terjadi kesalahan pada server.'; }
  }
  message = String(message);
  const normalized = message.toLowerCase();

  if (
    normalized.includes('already been registered') ||
    normalized.includes('already registered') ||
    normalized.includes('user already exists') ||
    normalized.includes('email_exists')
  ) {
    return 'Email tersebut sudah terdaftar.';
  }

  if (normalized.includes('invalid email')) return 'Format email tidak valid.';
  if (normalized.includes('password')) return 'Password tidak memenuhi kebijakan keamanan Supabase.';
  if (normalized.includes('rate limit')) return 'Terlalu banyak permintaan. Coba lagi beberapa saat.';
  if (normalized.includes('student_registration_invites') || normalized.includes('registration_status') || normalized.includes('photo_paths') || normalized.includes('journal_deletion_requests') || normalized.includes('approve_journal_deletion_request') || normalized.includes('account_deletion_requests')) {
    return 'Upgrade database belum lengkap. Jalankan SQL upgrade yang sesuai, termasuk enable-account-deletion-approval.sql, melalui SQL Editor Supabase.';
  }
  if (normalized.includes('bucket not found') || normalized.includes('journal-photos')) {
    return 'Penyimpanan foto belum siap. Jalankan database/upgrade-photo-registration.sql melalui SQL Editor Supabase.';
  }

  return message;
}
