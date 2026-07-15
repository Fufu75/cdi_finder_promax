import { NextResponse } from "next/server";
import { getCandidature, getProfil } from "@/lib/data";
import { buildCvDocx } from "@/lib/docx";
import { slug } from "@/lib/slug";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [cand, profil] = await Promise.all([getCandidature(id), getProfil()]);

  if (!cand || !cand.cv_data) {
    return NextResponse.json({ error: "CV introuvable." }, { status: 404 });
  }

  const langue = cand.langue === "en" ? "en" : "fr";
  const buffer = await buildCvDocx(cand.cv_data, profil.identite ?? {}, langue);
  const nom = `CV_${slug(cand.poste, "poste")}_${slug(cand.entreprise, "entreprise")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nom}"`,
    },
  });
}
