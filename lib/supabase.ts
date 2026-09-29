import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabase() {
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  return createClient(url, key);
}

export function getSupabaseAdmin() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Supabase server secret is missing.");
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
}
