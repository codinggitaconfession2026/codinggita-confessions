import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin";
import {getSupabaseAdmin} from "@/lib/supabase";

export async function GET(){
  if(!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const s=getSupabaseAdmin();
  const [{data:posts},{data:confessions},{data:reports},{data:pendingProfiles}]=await Promise.all([
    s.from("posts").select("*").eq("status","pending").order("created_at",{ascending:false}).limit(100),
    s.from("confessions").select("*").in("status",["pending","flagged"]).order("created_at",{ascending:false}).limit(100),
    s.from("reports").select("*").eq("status","open").order("created_at",{ascending:true}).limit(100),
    s.from("profiles").select("id,username,display_name,role,approval_status,created_at").eq("role","student").eq("approval_status","pending").order("created_at",{ascending:true}).limit(100)
  ]);
  let emails=new Map<string,string>();
  try{const {data:users}=await s.auth.admin.listUsers({page:1,perPage:1000});for(const u of users?.users||[])emails.set(u.id,u.email||"")}catch{}
  const pendingUsers=(pendingProfiles||[]).map(p=>({...p,email:emails.get(p.id)||""}));
  return NextResponse.json({posts:posts||[],confessions:confessions||[],reports:reports||[],pendingUsers});
}