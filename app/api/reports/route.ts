import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
export async function POST(req:Request){
  try{
    const b=await req.json(); const confessionId=String(b.confessionId||""); const reason=String(b.reason||"").trim().slice(0,300);
    if(!confessionId||!reason) return NextResponse.json({error:"Reason required."},{status:400});
    const {error}=await getSupabase().from("reports").insert({confession_id:confessionId,reason});
    if(error) throw error;
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"Report failed."},{status:500});}
}