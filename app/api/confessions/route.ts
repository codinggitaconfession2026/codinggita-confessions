import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { basicModeration } from "@/lib/moderation";

const categories = new Set(["Love","Funny","Coding","Rant","College Life","Other"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content = String(body.content ?? "").trim();
    const category = String(body.category ?? "Other");
    if (content.length < 10 || content.length > 1000) return NextResponse.json({error:"Confession must be 10–1000 characters."},{status:400});
    if (!categories.has(category)) return NextResponse.json({error:"Invalid category."},{status:400});
    const moderation = basicModeration(content);
    const supabase = getSupabase();
    const { error } = await supabase.from("confessions").insert({
      content, category, status: moderation.flagged ? "flagged" : "pending", moderation_note: moderation.flagged ? moderation.reasons.join(", ") : null
    });
    if(error) throw error;
    return NextResponse.json({ok:true});
  } catch(e) { return NextResponse.json({error:"Submission failed."},{status:500}); }
}