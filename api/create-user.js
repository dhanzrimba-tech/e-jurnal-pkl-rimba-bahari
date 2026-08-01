import { requireAdmin } from './_admin.js';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Metode tidak diizinkan'});
 const guard=await requireAdmin(req);if(guard.error)return res.status(guard.status).json({error:guard.error});
 const {full_name,email,password,role,phone}=req.body||{};
 if(!full_name||!email||!password||!['admin','student','teacher','field_supervisor'].includes(role))return res.status(400).json({error:'Data akun belum lengkap'});
 if(password.length<8)return res.status(400).json({error:'Password minimal 8 karakter'});
 const {data,error}=await guard.admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name,role,phone}});
 if(error)return res.status(400).json({error:error.message});
 const {error:upsertError}=await guard.admin.from('profiles').upsert({id:data.user.id,full_name,email,role,phone,is_active:true});
 if(upsertError)return res.status(400).json({error:upsertError.message});
 return res.status(200).json({success:true,user_id:data.user.id});
}
