import { getDb } from "./db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export async function supabaseFetch(path: string, options: RequestInit = {}) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured in .env.local");
  }

  const cleanUrl = SUPABASE_URL.replace(/\/$/, "");
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...options.headers,
  };

  const res = await fetch(`${cleanUrl}/rest/v1/${path}`, {
    ...options,
    headers,
  });

  return res;
}

export function getLocalDb() {
  return getDb();
}
