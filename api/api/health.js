import { sendJson } from './_supabase.js';

export default async function handler(req, res) {
  const configured = Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return sendJson(res, configured ? 200 : 503, {
    ok: configured,
    service: 'e-jurnal-api',
    configuration: configured ? 'ready' : 'incomplete',
  });
}
