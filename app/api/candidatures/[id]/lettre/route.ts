import { NextResponse } from "next/server";
import { getCandidature, getProfil } from "@/lib/data";
import { buildLettreDocx } from "@/lib/docx";
import { slug } from "@/lib/slug";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [cand, profil] = await Promise.all([getCandidature(id), getProfil()]);

  if (!cand || !cand.lettre) {
    return NextResponse.json({ error: "Lettre introuvable." }, { status: 404 });
  }

  const langue = cand.langue === "en" ? "en" : "fr";
  const buffer = await buildLettreDocx(
    cand.lettre,
    profil.identite ?? {},
    cand.offre_analysee,
    langue
  );
  const nom = `Lettre_${slug(cand.poste, "poste")}_${slug(cand.entreprise, "entreprise")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nom}"`,
    },
  });
}
