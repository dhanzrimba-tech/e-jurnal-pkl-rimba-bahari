import { allowPostOnly, sendJson } from './_supabase.js';

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;
  return sendJson(res, 410, {
    error: 'Alur pengajuan penghapusan akun sudah dinonaktifkan. Administrator dapat menghapus langsung melalui menu Akun Pengguna.',
  });
}
