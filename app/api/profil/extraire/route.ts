import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDecryptedKey } from "@/lib/data";
import { extraireTexteFichier } from "@/lib/cvparse";
import { extraireProfilDepuisCv } from "@/lib/llm";

export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const creds = await getDecryptedKey();
  if (!creds) {
    return NextResponse.json(
      { error: "Ajoute d'abord ta clé API dans Paramètres.", needsKey: true },
      { status: 400 }
    );
  }

  // Le CV arrive soit en fichier (multipart), soit en texte collé (JSON).
  let cvTexte = "";
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      cvTexte = await extraireTexteFichier(buffer, file.name, file.type);
    } else {
      const body = await request.json().catch(() => null);
      cvTexte = String(body?.texte ?? "").trim();
    }
  } catch {
    return NextResponse.json(
      { error: "Impossible de lire ce fichier. Essaie un PDF/DOCX ou colle le texte." },
      { status: 422 }
    );
  }

  if (cvTexte.length < 50) {
    return NextResponse.json(
      { error: "Le CV semble vide ou illisible. Colle le texte à la main." },
      { status: 422 }
    );
  }

  try {
    const profil = await extraireProfilDepuisCv(creds.provider, creds.key, creds.model, cvTexte);
    return NextResponse.json({ profil });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur d'extraction.";
    return NextResponse.json({ error: `Erreur du modèle : ${msg}` }, { status: 502 });
  }
}
