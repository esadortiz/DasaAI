import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let cachedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables");
  }
  cachedClient = createBrowserClient<Database>(url, key);
  return cachedClient;
}
