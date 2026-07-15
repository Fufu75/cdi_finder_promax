import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDecryptedKey, getProfil } from "@/lib/data";
import { extraireTexteDepuisUrl } from "@/lib/ingestion";
import { analyserOffre, genererCv, genererLettre } from "@/lib/anthropic";

export const maxDuration = 120; // secondes (Vercel)

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const mode: string = body?.mode ?? "texte";
  const notes: string | null = body?.notes || null;

  // 1. Récupérer le texte de l'offre
  let texteOffre: string | null = null;
  let lienOffre: string | null = null;

  if (mode === "url") {
    lienOffre = String(body?.url ?? "").trim();
    if (!lienOffre) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }
    texteOffre = await extraireTexteDepuisUrl(lienOffre);
    if (!texteOffre) {
      return NextResponse.json(
        {
          error:
            "Impossible de lire cette URL (LinkedIn/Indeed bloquent souvent). Colle le texte de l'offre à la main.",
          needsText: true,
        },
        { status: 422 }
      );
    }
  } else {
    texteOffre = String(body?.texte ?? "").trim();
    if (!texteOffre || texteOffre.length < 50) {
      return NextResponse.json(
        { error: "Le texte de l'offre est trop court." },
        { status: 400 }
      );
    }
  }

  // 2. Clé API + profil
  const creds = await getDecryptedKey();
  if (!creds) {
    return NextResponse.json(
      { error: "Aucune clé API. Ajoute-la dans Paramètres.", needsKey: true },
      { status: 400 }
    );
  }
  const profil = await getProfil();
  if (!profil || Object.keys(profil).length === 0) {
    return NextResponse.json(
      { error: "Ton profil est vide. Remplis-le dans Mon profil.", needsProfil: true },
      { status: 400 }
    );
  }

  // 3. Analyse + génération via Claude
  try {
    const offreAnalysee = await analyserOffre(creds.key, creds.model, texteOffre);
    const [cvData, lettre] = await Promise.all([
      genererCv(creds.key, creds.model, profil, offreAnalysee),
      genererLettre(creds.key, creds.model, profil, offreAnalysee),
    ]);

    const { data, error } = await supabase
      .from("candidatures")
      .insert({
        user_id: user.id,
        poste: offreAnalysee.poste ?? null,
        entreprise: offreAnalysee.entreprise ?? null,
        lieu: offreAnalysee.lieu ?? null,
        type_contrat: offreAnalysee.type_contrat ?? null,
        lien_offre: lienOffre,
        notes,
        offre_texte: texteOffre,
        offre_analysee: offreAnalysee,
        cv_data: cvData,
        lettre,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de la génération.";
    // Erreurs typiques : clé invalide (401), crédits épuisés, etc.
    return NextResponse.json({ error: `Claude : ${msg}` }, { status: 502 });
  }
}
