import { clients, sendJson } from './_supabase.js';

export default async function handler(req, res) {
  const configured = Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!configured) {
    return sendJson(res, 503, {
      ok: false,
      service: 'e-jurnal-api',
      configuration: 'incomplete',
    });
  }

  try {
    const { admin } = clients();
    const [profileProbe, journalProbe, inviteProbe, bucketProbe] = await Promise.all([
      admin.from('profiles').select('registration_status').limit(1),
      admin.from('daily_journals').select('photo_paths').limit(1),
      admin.from('student_registration_invites').select('id').limit(1),
      admin.storage.getBucket('journal-photos'),
    ]);

    const features = {
      registration_columns: !profileProbe.error,
      journal_photo_column: !journalProbe.error,
      registration_table: !inviteProbe.error,
      photo_bucket: !bucketProbe.error,
    };
    const ready = Object.values(features).every(Boolean);

    return sendJson(res, ready ? 200 : 503, {
      ok: ready,
      service: 'e-jurnal-api',
      configuration: 'ready',
      database_upgrade: ready ? 'ready' : 'incomplete',
      features,
    });
  } catch (error) {
    console.error('health:', error);
    return sendJson(res, 503, {
      ok: false,
      service: 'e-jurnal-api',
      configuration: 'ready',
      database_upgrade: 'error',
    });
  }
}
