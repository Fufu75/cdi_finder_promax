// URL d'une offre → texte principal.
// Beaucoup de sites (LinkedIn, Indeed) bloquent la lecture automatique :
// dans ce cas on renvoie null et l'utilisateur colle le texte à la main.
import * as cheerio from "cheerio";

export async function extraireTexteDepuisUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    $("script, style, nav, header, footer, noscript, svg, iframe").remove();

    // On privilégie <main> ou <article> s'ils existent, sinon <body>.
    const container = $("main").first().length
      ? $("main").first()
      : $("article").first().length
        ? $("article").first()
        : $("body");

    const texte = container
      .text()
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n\s*\n+/g, "\n\n")
      .trim();

    return texte.length > 200 ? texte : null;
  } catch {
    return null;
  }
}
