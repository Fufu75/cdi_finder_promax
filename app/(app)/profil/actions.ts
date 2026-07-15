"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveProfil(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "JSON invalide. Vérifie la syntaxe (virgules, guillemets…)." };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { error: "Le profil doit être un objet JSON { … }." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: user.id, data: parsed, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) return { error: error.message };

  revalidatePath("/profil");
  return { ok: true };
}
