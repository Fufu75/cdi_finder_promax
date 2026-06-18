"""Interface Streamlit — Agent de candidature CDI Finder."""
import json
import os
from datetime import datetime
from pathlib import Path

import streamlit as st

from core.ingestion import from_url, from_text
from core.analyse import analyser_offre
from core.generation import generer_cv, generer_lettre
from core.documents import creer_cv, creer_lettre
from core.journal import enregistrer_candidature

# ── Config ────────────────────────────────────────────────────────────────────
PROFIL_PATH = "profil/profil.json"
SORTIES_DIR = "sorties"
EXCEL_PATH = "suivi.xlsx"

st.set_page_config(
    page_title="CDI Finder",
    page_icon="📄",
    layout="centered",
)

# ── Chargement profil ─────────────────────────────────────────────────────────
@st.cache_data
def charger_profil():
    with open(PROFIL_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Helpers ───────────────────────────────────────────────────────────────────
def slug_offre(offre: dict) -> str:
    poste = offre.get("poste", "poste").replace(" ", "_")[:30]
    entreprise = offre.get("entreprise", "entreprise").replace(" ", "_")[:20]
    date = datetime.now().strftime("%Y%m%d_%H%M")
    return f"{date}_{poste}_{entreprise}"


def lire_fichier(chemin: str) -> bytes:
    with open(chemin, "rb") as f:
        return f.read()


# ── UI ────────────────────────────────────────────────────────────────────────
st.title("CDI Finder — Agent de candidature")
st.caption("Colle une offre, récupère un CV adapté + une lettre de motivation.")

# Vérification clé API
if not os.environ.get("ANTHROPIC_API_KEY"):
    st.error(
        "Variable d'environnement `ANTHROPIC_API_KEY` non définie. "
        "Lance l'app avec : `export ANTHROPIC_API_KEY='sk-...' && streamlit run app.py`"
    )
    st.stop()

profil = charger_profil()

# ── Étape 1 : saisie de l'offre ───────────────────────────────────────────────
st.subheader("1. Offre d'emploi")

mode = st.radio("Mode d'entrée", ["URL", "Texte"], horizontal=True)

texte_offre = None
lien_offre = ""

if mode == "URL":
    url = st.text_input("URL de l'offre", placeholder="https://...")
    if url:
        lien_offre = url
        with st.spinner("Extraction du texte…"):
            texte_offre = from_url(url)
        if texte_offre:
            with st.expander("Texte extrait", expanded=False):
                st.text(texte_offre[:3000] + ("…" if len(texte_offre) > 3000 else ""))
        else:
            st.warning(
                "Impossible d'extraire le texte (LinkedIn/Indeed bloquent souvent la lecture). "
                "Colle le texte manuellement ci-dessous."
            )
            texte_offre = None
            mode = "Texte"

if mode == "Texte":
    texte_colle = st.text_area(
        "Texte de l'offre",
        height=250,
        placeholder="Colle ici le texte complet de l'offre…",
    )
    if texte_colle.strip():
        texte_offre = from_text(texte_colle)

notes = st.text_input("Notes (optionnel)", placeholder="Ex : candidature prioritaire, relance le 15…")

# ── Étape 2 : analyse + génération ───────────────────────────────────────────
st.subheader("2. Génération")

if texte_offre:
    if st.button("Générer CV + Lettre", type="primary", use_container_width=True):

        # Analyse
        with st.spinner("Analyse de l'offre…"):
            try:
                offre_analysee = analyser_offre(texte_offre)
                st.session_state["offre_analysee"] = offre_analysee
            except Exception as e:
                st.error(f"Erreur lors de l'analyse : {e}")
                st.stop()

        with st.expander("Offre analysée", expanded=False):
            st.json(offre_analysee)

        # Génération CV
        with st.spinner("Génération du CV…"):
            try:
                cv_data = generer_cv(offre_analysee, PROFIL_PATH)
                st.session_state["cv_data"] = cv_data
            except Exception as e:
                st.error(f"Erreur lors de la génération du CV : {e}")
                st.stop()

        # Génération lettre
        with st.spinner("Génération de la lettre de motivation…"):
            try:
                texte_lettre = generer_lettre(offre_analysee, PROFIL_PATH)
                st.session_state["texte_lettre"] = texte_lettre
            except Exception as e:
                st.error(f"Erreur lors de la génération de la lettre : {e}")
                st.stop()

        # Export .docx
        slug = slug_offre(offre_analysee)
        chemin_cv = str(Path(SORTIES_DIR) / f"CV_{slug}.docx")
        chemin_lettre = str(Path(SORTIES_DIR) / f"Lettre_{slug}.docx")

        with st.spinner("Création des fichiers .docx…"):
            try:
                creer_cv(cv_data, profil["identite"], chemin_cv)
                creer_lettre(texte_lettre, profil["identite"], offre_analysee, chemin_lettre)
            except Exception as e:
                st.error(f"Erreur lors de la création des .docx : {e}")
                st.stop()

        # Journal Excel
        enregistrer_candidature(
            offre_analysee,
            chemin_cv=chemin_cv,
            chemin_lettre=chemin_lettre,
            lien_offre=lien_offre,
            notes=notes,
            chemin_excel=EXCEL_PATH,
        )

        st.session_state["chemin_cv"] = chemin_cv
        st.session_state["chemin_lettre"] = chemin_lettre
        st.success("Documents générés et offre enregistrée dans suivi.xlsx.")

else:
    st.info("Renseigne une URL ou colle le texte de l'offre pour continuer.")

# ── Étape 3 : aperçu + téléchargement ────────────────────────────────────────
if "cv_data" in st.session_state:
    st.subheader("3. Résultat")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("**CV adapté**")
        cv = st.session_state["cv_data"]
        st.markdown(f"*{cv.get('titre_cv', '')}*")
        if cv.get("resume"):
            st.caption(cv["resume"])
        for exp in cv.get("experiences", []):
            st.markdown(f"**{exp['intitule']}** — {exp['entreprise']} ({exp['periode']})")

        if "chemin_cv" in st.session_state:
            st.download_button(
                label="Télécharger le CV (.docx)",
                data=lire_fichier(st.session_state["chemin_cv"]),
                file_name=Path(st.session_state["chemin_cv"]).name,
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                use_container_width=True,
            )

    with col2:
        st.markdown("**Lettre de motivation**")
        if "texte_lettre" in st.session_state:
            st.text_area(
                label="",
                value=st.session_state["texte_lettre"],
                height=280,
                disabled=True,
            )
        if "chemin_lettre" in st.session_state:
            st.download_button(
                label="Télécharger la lettre (.docx)",
                data=lire_fichier(st.session_state["chemin_lettre"]),
                file_name=Path(st.session_state["chemin_lettre"]).name,
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                use_container_width=True,
            )
