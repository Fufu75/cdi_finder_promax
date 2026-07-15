"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Statut } from "@/lib/types";

export async function updateStatut(id: string, statut: Statut) {
  const supabase = await createClient();
  await supabase
    .from("candidatures")
    .update({ statut, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/candidatures/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteCandidature(id: string) {
  const supabase = await createClient();
  await supabase.from("candidatures").delete().eq("id", id);
  redirect("/dashboard");
}
