// Helpers de lecture de données côté serveur.
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { DEFAULT_MODEL } from "@/lib/anthropic";
import type { Candidature, Profil } from "@/lib/types";

export async function getProfil(): Promise<Profil> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("data")
    .maybeSingle();
  return (data?.data as Profil) ?? {};
}

export interface Settings {
  hasKey: boolean;
  keyLast4: string | null;
  model: string;
}

export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("anthropic_key_encrypted, key_last4, model")
    .maybeSingle();
  return {
    hasKey: Boolean(data?.anthropic_key_encrypted),
    keyLast4: data?.key_last4 ?? null,
    model: data?.model ?? DEFAULT_MODEL,
  };
}

// Renvoie la clé API en clair (déchiffrée) — usage serveur uniquement, au moment de l'appel.
export async function getDecryptedKey(): Promise<{ key: string; model: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("anthropic_key_encrypted, model")
    .maybeSingle();
  if (!data?.anthropic_key_encrypted) return null;
  return {
    key: decrypt(data.anthropic_key_encrypted),
    model: data.model ?? DEFAULT_MODEL,
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
