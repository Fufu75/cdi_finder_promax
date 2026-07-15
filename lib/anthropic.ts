// Appels à Claude : analyse d'offre + génération CV / lettre.
// La clé API est fournie par l'utilisateur (BYOK), déchiffrée juste avant l'appel.
import Anthropic from "@anthropic-ai/sdk";
import type { CvData, OffreAnalysee, Profil } from "./types";

export const DEFAULT_MODEL = "claude-opus-4-8";

const PROMPT_ANALYSE = `Tu es un expert en recrutement. Analyse l'offre d'emploi ci-dessous et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec cette structure exacte :

{
  "poste": "intitulé exact du poste",
  "entreprise": "nom de l'entreprise",
  "secteur": "secteur d'activité",
  "lieu": "ville / remote / hybride",
  "type_contrat": "CDI / CDD / stage / alternance",
  "competences_requises": ["liste", "des", "compétences", "techniques", "obligatoires"],
  "competences_souhaitees": ["compétences", "un", "plus"],
  "mots_cles_ats": ["mots-clés", "importants", "pour", "l'ATS"],
  "missions_principales": ["description courte de chaque mission clé"],
  "profil_recherche": "description synthétique du profil idéal",
  "valeurs_entreprise": ["valeurs ou culture mentionnées"],
  "niveau_experience": "junior / confirmé / senior / non précisé"
}

OFFRE D'EMPLOI :
`;

const PROMPT_CV = (profil: string, offre: string) => `Tu es un expert en recrutement et rédaction de CV ATS.

Voici le profil réel du candidat (NE PAS inventer d'expérience, uniquement sélectionner, réordonner et reformuler ce qui existe) :
${profil}

Voici l'offre d'emploi analysée :
${offre}

Génère un CV optimisé ATS au format JSON. Règles strictes :
- Sélectionne uniquement les expériences, projets et compétences pertinents pour cette offre.
- Reformule les missions pour utiliser les mots-clés de l'offre (sans inventer de faits).
- Ordonne les sections : Expériences (les plus pertinentes en premier), Formation, Projets, Compétences, Langues.
- Utilise des verbes d'action forts au passé composé ou présent selon le contexte.
- Pas de tableau, pas de colonne, pas de graphique.

Retourne UNIQUEMENT un objet JSON valide avec cette structure :
{
  "titre_cv": "intitulé adapté à l'offre",
  "resume": "accroche de 2-3 phrases maximum",
  "experiences": [
    { "intitule": "...", "entreprise": "...", "lieu": "...", "periode": "mois AAAA – mois AAAA", "missions": ["mission reformulée 1", "mission reformulée 2"] }
  ],
  "formations": [
    { "diplome": "...", "etablissement": "...", "lieu": "...", "periode": "...", "description": "..." }
  ],
  "projets": [
    { "titre": "...", "technologies": "...", "description": "..." }
  ],
  "competences": { "techniques": ["..."], "cloud": ["..."], "autres": ["..."] },
  "langues": ["Français – Natif", "Anglais – C1"]
}`;

const PROMPT_LETTRE = (profil: string, offre: string) => `Tu es un expert en rédaction de lettres de motivation percutantes.

Profil du candidat :
${profil}

Offre d'emploi analysée :
${offre}

Rédige une lettre de motivation professionnelle en français. Règles :
- Longueur : 3 paragraphes, environ 250-300 mots au total.
- Paragraphe 1 : accroche + pourquoi ce poste / cette entreprise.
- Paragraphe 2 : 2-3 expériences concrètes du profil qui matchent directement les besoins de l'offre.
- Paragraphe 3 : projection, valeur ajoutée, call to action.
- Ton : professionnel mais direct, pas de formules creuses.
- N'invente aucun fait : utilise uniquement ce qui est dans le profil.

Retourne UNIQUEMENT le texte de la lettre (pas de JSON, pas d'en-tête, juste le corps).`;

function textOf(message: Anthropic.Message): string {
  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text.trim() : "";
}

// Extrait un objet JSON même si le modèle l'entoure de ```json ... ```.
function parseJson<T>(raw: string): T {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  }
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return JSON.parse(s) as T;
}

export async function analyserOffre(
  apiKey: string,
  model: string,
  texteOffre: string
): Promise<OffreAnalysee> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: 1500,
    messages: [{ role: "user", content: PROMPT_ANALYSE + texteOffre }],
  });
  return parseJson<OffreAnalysee>(textOf(message));
}

export async function genererCv(
  apiKey: string,
  model: string,
  profil: Profil,
  offre: OffreAnalysee
): Promise<CvData> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: PROMPT_CV(
          JSON.stringify(profil, null, 2),
          JSON.stringify(offre, null, 2)
        ),
      },
    ],
  });
  return parseJson<CvData>(textOf(message));
}

export async function genererLettre(
  apiKey: string,
  model: string,
  profil: Profil,
  offre: OffreAnalysee
): Promise<string> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: PROMPT_LETTRE(
          JSON.stringify(profil, null, 2),
          JSON.stringify(offre, null, 2)
        ),
      },
    ],
  });
  return textOf(message);
}
