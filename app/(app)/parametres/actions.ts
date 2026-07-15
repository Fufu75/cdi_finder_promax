"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";

export async function saveSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const model = String(formData.get("model") ?? "claude-opus-4-8");

  const payload: Record<string, unknown> = {
    user_id: user.id,
    model,
    updated_at: new Date().toISOString(),
  };

  // La clé n'est mise à jour que si l'utilisateur en saisit une nouvelle.
  if (apiKey) {
    if (!apiKey.startsWith("sk-ant-")) {
      return { error: "La clé doit commencer par « sk-ant- »." };
    }
    payload.anthropic_key_encrypted = encrypt(apiKey);
    payload.key_last4 = apiKey.slice(-4);
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return { error: error.message };

  revalidatePath("/parametres");
  return { ok: true };
}
