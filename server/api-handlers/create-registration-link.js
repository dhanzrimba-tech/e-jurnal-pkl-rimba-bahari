import { createHash, randomBytes } from 'node:crypto';
import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveAdmin,
  sendJson,
} from './_supabase.js';

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function cleanNullableUuid(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (!/^[0-9a-f-]{36}$/i.test(text)) {
    const error = new Error('ID pembimbing tidak valid.');
    error.statusCode = 400;
    throw error;
  }
  return text;
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const body = parseBody(req);
    const fullName = String(body.full_name || '').trim();
    const nis = String(body.nis || '').trim();
    const className = String(body.class_name || '').trim();
    const internshipPlace = String(body.internship_place || '').trim();
    const teacherId = cleanNullableUuid(body.teacher_id);
    const fieldSupervisorId = cleanNullableUuid(body.field_supervisor_id);
    const startDate = String(body.start_date || '').trim() || null;
    const endDate = String(body.end_date || '').trim() || null;
    const validDays = Math.min(30, Math.max(1, Number(body.valid_days || 14)));

    if (fullName.length < 2) return sendJson(res, 400, { error: 'Nama siswa minimal 2 karakter.' });
    if (!nis) return sendJson(res, 400, { error: 'NIS wajib diisi.' });
    if (!className) return sendJson(res, 400, { error: 'Kelas wajib diisi.' });
    if (!internshipPlace) return sendJson(res, 400, { error: 'Tempat PKL wajib diisi.' });

    const { admin, actor } = await requireActiveAdmin(req);
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await admin.from('student_registration_invites').insert({
      token_hash: tokenHash,
      full_name: fullName,
      nis,
      class_name: className,
      internship_place: internshipPlace,
      teacher_id: teacherId,
      field_supervisor_id: fieldSupervisorId,
      start_date: startDate,
      end_date: endDate,
      expires_at: expiresAt,
      status: 'available',
      created_by: actor.id,
    });
    if (error) throw error;

    return sendJson(res, 201, { ok: true, token: rawToken, expires_at: expiresAt });
  } catch (error) {
    console.error('create-registration-link:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
