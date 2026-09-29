import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { basicModeration } from "@/lib/moderation";

export async function POST(req:Request){
  try{
    const b=await req.json(); const confessionId=String(b.confessionId||""); const content=String(b.content||"").trim();
    if(!confessionId || content.length<2 || content.length>500) return NextResponse.json({error:"Invalid comment."},{status:400});
    const m=basicModeration(content); const s=getSupabase();
    const {data:c}=await s.from("confessions").select("id").eq("id",confessionId).eq("status","approved").single();
    if(!c) return NextResponse.json({error:"Confession not found."},{status:404});
    const {error}=await s.from("comments").insert({confession_id:confessionId,content,status:m.flagged?"flagged":"pending"});
    if(error) throw error;
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"Could not submit comment."},{status:500});}
}