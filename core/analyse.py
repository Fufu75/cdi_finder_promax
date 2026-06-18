"""Texte de l'offre → JSON structuré via LLM."""
import json
from config import get_client

PROMPT_ANALYSE = """Tu es un expert en recrutement. Analyse l'offre d'emploi ci-dessous et retourne UNIQUEMENT un objet JSON valide (sans markdown, sans explication) avec cette structure exacte :

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
{offre}"""


def analyser_offre(texte_offre: str) -> dict:
    """Envoie le texte de l'offre à Claude et retourne un dict structuré."""
    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": PROMPT_ANALYSE.replace("{offre}", texte_offre),
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Nettoie les éventuels blocs ```json ... ```
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)
