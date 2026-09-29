import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = new URL(req.url).searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  const s = getSupabaseAdmin();
  const { data, error } = await s.from("support_messages").select("*").eq("user_id", userId).order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data || [] });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user_id, content } = await req.json();
  if (!user_id || typeof content !== "string" || content.trim().length < 1 || content.trim().length > 2000) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
  const s = getSupabaseAdmin();
  const { error } = await s.from("support_messages").insert({ user_id, sender_role: "admin", content: content.trim() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
