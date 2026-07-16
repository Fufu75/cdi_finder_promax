// Helpers de lecture de données côté serveur.
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { PROVIDERS, isProvider, type Provider } from "@/lib/providers";
import type { Candidature, Profil } from "@/lib/types";

export async function getProfil(): Promise<Profil> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("data").maybeSingle();
  return (data?.data as Profil) ?? {};
}

// Colonnes de stockage (clé chiffrée + 4 derniers caractères) par fournisseur.
const COLS: Record<Provider, { enc: string; last4: string }> = {
  anthropic: { enc: "anthropic_key_encrypted", last4: "key_last4" },
  openai: { enc: "openai_key_encrypted", last4: "openai_key_last4" },
  gemini: { enc: "gemini_key_encrypted", last4: "gemini_key_last4" },
};

export interface Settings {
  provider: Provider;
  model: string;
  hasKey: boolean; // le fournisseur actif a-t-il une clé ?
  keys: Record<Provider, { hasKey: boolean; last4: string | null }>;
}

export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select(
      "provider, model, anthropic_key_encrypted, key_last4, openai_key_encrypted, openai_key_last4, gemini_key_encrypted, gemini_key_last4"
    )
    .maybeSingle();

  const row = (data ?? {}) as Record<string, string | null>;
  const provider: Provider = isProvider(row.provider) ? row.provider : "anthropic";

  const keys = {
    anthropic: { hasKey: !!row.anthropic_key_encrypted, last4: row.key_last4 ?? null },
    openai: { hasKey: !!row.openai_key_encrypted, last4: row.openai_key_last4 ?? null },
    gemini: { hasKey: !!row.gemini_key_encrypted, last4: row.gemini_key_last4 ?? null },
  } satisfies Settings["keys"];

  return {
    provider,
    model: row.model || PROVIDERS[provider].defaultModel,
    hasKey: keys[provider].hasKey,
    keys,
  };
}

// Renvoie la clé du fournisseur actif, en clair — usage serveur uniquement, à l'appel.
export async function getDecryptedKey(): Promise<{
  provider: Provider;
  key: string;
  model: string;
} | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select(
      "provider, model, anthropic_key_encrypted, openai_key_encrypted, gemini_key_encrypted"
    )
    .maybeSingle();
  if (!data) return null;

  const row = data as Record<string, string | null>;
  const provider: Provider = isProvider(row.provider) ? row.provider : "anthropic";
  const enc = row[COLS[provider].enc];
  if (!enc) return null;

  return {
    provider,
    key: decrypt(enc),
    model: row.model || PROVIDERS[provider].defaultModel,
  };
}

export async function getCandidatures(): Promise<Candidature[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidatures")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Candidature[]) ?? [];
}

export async function getCandidature(id: string): Promise<Candidature | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidatures")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Candidature) ?? null;
}
