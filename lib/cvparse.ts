// Extraction du texte d'un fichier CV (PDF / DOCX / texte).
import mammoth from "mammoth";

export async function extraireTexteFichier(
  buffer: Buffer,
  filename: string,
  mime: string
): Promise<string> {
  const name = filename.toLowerCase();

  // DOCX
  if (name.endsWith(".docx") || mime.includes("wordprocessingml")) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
  }

  // PDF
  if (name.endsWith(".pdf") || mime.includes("pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return (Array.isArray(text) ? text.join("\n") : text).trim();
  }

  // Texte brut (.txt, .md…)
  return buffer.toString("utf8").trim();
}
