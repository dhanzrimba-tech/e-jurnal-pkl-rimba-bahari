import { createClient } from '@supabase/supabase-js';
export async function requireAdmin(req){
  const url=process.env.SUPABASE_URL;
  const anon=process.env.SUPABASE_ANON_KEY;
  const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!anon||!service) return {error:'Konfigurasi server belum lengkap',status:500};
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) return {error:'Tidak terautentikasi',status:401};
  const authClient=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}});
  const {data:{user},error}=await authClient.auth.getUser();
  if(error||!user) return {error:'Sesi tidak valid',status:401};
  const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:profile}=await admin.from('profiles').select('role,is_active').eq('id',user.id).single();
  if(!profile||profile.role!=='admin'||!profile.is_active) return {error:'Hanya administrator yang diizinkan',status:403};
  return {admin,user};
}
