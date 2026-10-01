import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { basicModeration } from "@/lib/moderation";

const categories = new Set(["Love","Funny","Coding","Rant","College Life","Other"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Simple honeypot for basic bot filtering. It is intentionally not shown in the UI.
    if (String(body.website ?? "").trim()) return NextResponse.json({ ok: true });

    const content = String(body.content ?? "").trim();
    const category = String(body.category ?? "Other");

    if (content.length < 10 || content.length > 1000) {
      return NextResponse.json({ error: "Confession must be 10–1000 characters." }, { status: 400 });
    }
    if (!categories.has(category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const moderation = basicModeration(content);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.from("confessions").insert({
      content,
      category,
      status: moderation.flagged ? "flagged" : "pending",
      moderation_note: moderation.flagged ? moderation.reasons.join(", ") : null
    }).select("id").single();

    if (error) throw error;
    return NextResponse.json({ ok: true, id: data?.id });
  } catch {
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
