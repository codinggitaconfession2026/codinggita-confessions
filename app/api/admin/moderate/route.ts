import {NextResponse} from "next/server";
import {isAdmin} from "@/lib/admin";
import {getSupabaseAdmin} from "@/lib/supabase";

export async function POST(req:Request){
  if(!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {action,id,type="post"}=await req.json();
  const s=getSupabaseAdmin();
  const target=type==="confession"?"confessions":type==="user"?"profiles":"posts";
  if((type==="post"||type==="confession")&&(action==="approve"||action==="reject")){
    const {error}=await s.from(target).update({status:action==="approve"?"approved":"rejected"}).eq("id",id);
    if(error)return NextResponse.json({error:error.message},{status:500});
  }else if(type==="user"&&(action==="approve"||action==="reject")){
    const {error}=await s.from("profiles").update({approval_status:action==="approve"?"approved":"rejected"}).eq("id",id).eq("role","student");
    if(error)return NextResponse.json({error:error.message},{status:500});
  }else if(type==="report"&&action==="resolve"){
    const {error}=await s.from("reports").update({status:"resolved"}).eq("id",id);
    if(error)return NextResponse.json({error:error?.message||"Update failed"},{status:500});
  }else return NextResponse.json({error:"Invalid moderation action."},{status:400});
  return NextResponse.json({ok:true});
}