import { supabase } from "./supabaseClient.js";

// One row per user in the `saves` table (see supabase/schema.sql), keyed by
// user_id, holding the whole save object as a jsonb blob.

export async function fetchCloudSave(userId) {
  const { data, error } = await supabase
    .from("saves")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

export async function pushCloudSave(userId, save) {
  const { error } = await supabase
    .from("saves")
    .upsert({ user_id: userId, data: save, updated_at: new Date().toISOString() });
  if (error) throw error;
}
