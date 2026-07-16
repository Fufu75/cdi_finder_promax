"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { PROVIDERS, isProvider, type Provider } from "@/lib/providers";

const COLS: Record<Provider, { enc: string; last4: string }> = {
  anthropic: { enc: "anthropic_key_encrypted", last4: "key_last4" },
  openai: { enc: "openai_key_encrypted", last4: "openai_key_last4" },
  gemini: { enc: "gemini_key_encrypted", last4: "gemini_key_last4" },
};

export async function saveSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const providerRaw = String(formData.get("provider") ?? "anthropic");
  const provider: Provider = isProvider(providerRaw) ? providerRaw : "anthropic";
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim() || PROVIDERS[provider].defaultModel;

  const payload: Record<string, unknown> = {
    user_id: user.id,
    provider,
    model,
    updated_at: new Date().toISOString(),
  };

  // La clé n'est mise à jour que si l'utilisateur en saisit une nouvelle.
  if (apiKey) {
    const prefix = PROVIDERS[provider].keyPrefix;
    if (prefix && !apiKey.startsWith(prefix)) {
      return { error: `La clé ${PROVIDERS[provider].label} doit commencer par « ${prefix} ».` };
    }
    payload[COLS[provider].enc] = encrypt(apiKey);
    payload[COLS[provider].last4] = apiKey.slice(-4);
  }

  const { error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return { error: error.message };

  revalidatePath("/parametres");
  return { ok: true };
}
