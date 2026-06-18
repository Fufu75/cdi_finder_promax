"""Génération du CV adapté et de la lettre de motivation via LLM."""
import json
from config import get_client

PROMPT_CV = """Tu es un expert en recrutement et rédaction de CV ATS.

Voici le profil réel du candidat (NE PAS inventer d'expérience, uniquement sélectionner, réordonner et reformuler ce qui existe) :
{profil}

Voici l'offre d'emploi analysée :
{offre_analysee}

Génère un CV optimisé ATS au format JSON. Règles strictes :
- Sélectionne uniquement les expériences, projets et compétences pertinents pour cette offre.
- Reformule les missions pour utiliser les mots-clés de l'offre (sans inventer de faits).
- Ordonne les sections : Expériences (les plus pertinentes en premier), Formation, Projets, Compétences, Langues.
- Utilise des verbes d'action forts au passé composé ou présent selon le contexte.
- Pas de tableau, pas de colonne, pas de graphique.

Retourne UNIQUEMENT un objet JSON valide avec cette structure :
{{
  "titre_cv": "intitulé adapté à l'offre",
  "resume": "accroche de 2-3 phrases maximum",
  "experiences": [
    {{
      "intitule": "...",
      "entreprise": "...",
      "lieu": "...",
      "periode": "mois AAAA – mois AAAA",
      "missions": ["mission reformulée 1", "mission reformulée 2"]
    }}
  ],
  "formations": [
    {{
      "diplome": "...",
      "etablissement": "...",
      "lieu": "...",
      "periode": "...",
      "description": "..."
    }}
  ],
  "projets": [
    {{
      "titre": "...",
      "technologies": "...",
      "description": "..."
    }}
  ],
  "competences": {{
    "techniques": ["..."],
    "cloud": ["..."],
    "autres": ["..."]
  }},
  "langues": ["Français – Natif", "Anglais – C1 (TOEIC 930/990)"]
}}"""

PROMPT_LETTRE = """Tu es un expert en rédaction de lettres de motivation percutantes.

Profil du candidat :
{profil}

Offre d'emploi analysée :
{offre_analysee}

Rédige une lettre de motivation professionnelle en français. Règles :
- Longueur : 3 paragraphes, environ 250-300 mots au total.
- Paragraphe 1 : accroche + pourquoi ce poste / cette entreprise.
- Paragraphe 2 : 2-3 expériences concrètes du profil qui matchent directement les besoins de l'offre.
- Paragraphe 3 : projection, valeur ajoutée, call to action.
- Ton : professionnel mais direct, pas de formules creuses.
- N'invente aucun fait : utilise uniquement ce qui est dans le profil.

Retourne UNIQUEMENT le texte de la lettre (pas de JSON, pas d'en-tête, juste le corps)."""


def _charger_profil(chemin: str = "profil/profil.json") -> dict:
    with open(chemin, "r", encoding="utf-8") as f:
        return json.load(f)


def generer_cv(offre_analysee: dict, chemin_profil: str = "profil/profil.json") -> dict:
    """Retourne un dict structuré représentant le CV adapté."""
    client = get_client()
    profil = _charger_profil(chemin_profil)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": PROMPT_CV.format(
                    profil=json.dumps(profil, ensure_ascii=False, indent=2),
                    offre_analysee=json.dumps(offre_analysee, ensure_ascii=False, indent=2),
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


def generer_lettre(offre_analysee: dict, chemin_profil: str = "profil/profil.json") -> str:
    """Retourne le texte brut de la lettre de motivation."""
    client = get_client()
    profil = _charger_profil(chemin_profil)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": PROMPT_LETTRE.format(
                    profil=json.dumps(profil, ensure_ascii=False, indent=2),
                    offre_analysee=json.dumps(offre_analysee, ensure_ascii=False, indent=2),
                ),
            }
        ],
    )

    return message.content[0].text.strip()
