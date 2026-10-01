import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
export async function POST(req:Request){
  try{
    const b=await req.json();
    if(String(b.website||"").trim()) return NextResponse.json({ok:true});
    const confessionId=String(b.confessionId||"");
    const reason=String(b.reason||"").trim().slice(0,300);
    if(!confessionId||!reason) return NextResponse.json({error:"Reason required."},{status:400});
    const s=getSupabaseAdmin();
    const {data:c}=await s.from("confessions").select("id").eq("id",confessionId).eq("status","approved").single();
    if(!c) return NextResponse.json({error:"Confession not found."},{status:404});
    const {error}=await s.from("reports").insert({confession_id:confessionId,reason});
    if(error) throw error;
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"Report failed."},{status:500});}
}
