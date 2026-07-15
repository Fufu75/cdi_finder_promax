// Génération des documents .docx compatibles ATS (une seule colonne, titres standards).
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import type { CvData, Identite, OffreAnalysee } from "./types";

function heading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24 })],
  });
}

function line(text: string, opts: { bold?: boolean; italics?: boolean; size?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size ?? 22 }),
    ],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 20 },
    children: [new TextRun({ text, size: 22 })],
  });
}

export async function buildCvDocx(cv: CvData, identite: Identite): Promise<Buffer> {
  const children: Paragraph[] = [];

  const nomComplet = [identite.prenom, identite.nom].filter(Boolean).join(" ");
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: nomComplet || "Candidat", bold: true, size: 36 })],
    })
  );
  if (cv.titre_cv) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: cv.titre_cv, size: 24 })],
      })
    );
  }

  const contact = [
    identite.email,
    identite.telephone,
    identite.ville,
    identite.linkedin,
    identite.github,
  ]
    .filter(Boolean)
    .join("  •  ");
  if (contact) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: contact, size: 18 })],
      })
    );
  }

  if (cv.resume) {
    children.push(heading("Profil"));
    children.push(line(cv.resume));
  }

  if (cv.experiences?.length) {
    children.push(heading("Expériences professionnelles"));
    for (const exp of cv.experiences) {
      const entete = [exp.intitule, exp.entreprise].filter(Boolean).join(" — ");
      children.push(line(entete, { bold: true }));
      const sous = [exp.lieu, exp.periode].filter(Boolean).join(" · ");
      if (sous) children.push(line(sous, { italics: true, size: 20 }));
      for (const m of exp.missions ?? []) children.push(bullet(m));
    }
  }

  if (cv.formations?.length) {
    children.push(heading("Formation"));
    for (const f of cv.formations) {
      children.push(line([f.diplome, f.etablissement].filter(Boolean).join(" — "), { bold: true }));
      const sous = [f.lieu, f.periode].filter(Boolean).join(" · ");
      if (sous) children.push(line(sous, { italics: true, size: 20 }));
      if (f.description) children.push(line(f.description, { size: 20 }));
    }
  }

  if (cv.projets?.length) {
    children.push(heading("Projets"));
    for (const p of cv.projets) {
      children.push(line(p.titre, { bold: true }));
      if (p.technologies) children.push(line(p.technologies, { italics: true, size: 20 }));
      if (p.description) children.push(line(p.description, { size: 20 }));
    }
  }

  if (cv.competences && Object.keys(cv.competences).length) {
    children.push(heading("Compétences"));
    for (const [cat, items] of Object.entries(cv.competences)) {
      if (Array.isArray(items) && items.length) {
        children.push(line(`${cat} : ${items.join(", ")}`));
      }
    }
  }

  if (cv.langues?.length) {
    children.push(heading("Langues"));
    children.push(line(cv.langues.join("  •  ")));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [{ properties: {}, children }],
  });
  return Packer.toBuffer(doc);
}

export async function buildLettreDocx(
  lettre: string,
  identite: Identite,
  offre: OffreAnalysee | null
): Promise<Buffer> {
  const children: Paragraph[] = [];
  const nomComplet = [identite.prenom, identite.nom].filter(Boolean).join(" ");

  children.push(line(nomComplet, { bold: true }));
  for (const c of [identite.email, identite.telephone, identite.ville].filter(Boolean)) {
    children.push(line(c as string, { size: 20 }));
  }
  children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));

  if (offre?.entreprise) {
    children.push(line(`À l'attention de ${offre.entreprise}`, { bold: true }));
  }
  if (offre?.poste) {
    children.push(line(`Objet : Candidature au poste de ${offre.poste}`));
  }
  children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));

  for (const para of lettre.split(/\n\s*\n/)) {
    const t = para.trim();
    if (t) {
      children.push(
        new Paragraph({
          spacing: { after: 160 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: t, size: 22 })],
        })
      );
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [{ properties: {}, children }],
  });
  return Packer.toBuffer(doc);
}
