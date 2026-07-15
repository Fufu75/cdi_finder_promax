// Nettoie une chaîne pour en faire un nom de fichier sûr.
export function slug(s: string | null | undefined, fallback: string): string {
  const cleaned = (s ?? fallback)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return cleaned || fallback;
}
