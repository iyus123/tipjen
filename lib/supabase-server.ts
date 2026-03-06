import { createClient } from "@supabase/supabase-js";

export function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase env belum diset");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}
