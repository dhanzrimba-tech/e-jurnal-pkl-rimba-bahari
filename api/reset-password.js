import { requireAdmin } from './_admin.js';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Metode tidak diizinkan'});
 const guard=await requireAdmin(req);if(guard.error)return res.status(guard.status).json({error:guard.error});
 const {user_id,new_password}=req.body||{};
 if(!user_id||!new_password)return res.status(400).json({error:'User dan password baru wajib diisi'});
 if(new_password.length<8)return res.status(400).json({error:'Password minimal 8 karakter'});
 const {data:target}=await guard.admin.from('profiles').select('role').eq('id',user_id).single();
 if(!target||!['student','teacher','field_supervisor','admin'].includes(target.role))return res.status(404).json({error:'Akun tidak ditemukan'});
 const {error}=await guard.admin.auth.admin.updateUserById(user_id,{password:new_password});
 if(error)return res.status(400).json({error:error.message});
 await guard.admin.from('audit_logs').insert({actor_id:guard.user.id,action:'RESET_PASSWORD',target_table:'auth.users',target_id:user_id});
 return res.status(200).json({success:true});
}
