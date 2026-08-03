import { allowPostOnly, sendJson } from './_supabase.js';

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;
  return sendJson(res, 410, {
    error: 'Penghapusan langsung dinonaktifkan. Buat permintaan penghapusan beserta alasan, lalu proses melalui persetujuan administrator.',
  });
}
