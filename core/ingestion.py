"""URL → texte, ou texte collé directement."""
import trafilatura


def from_url(url: str) -> str | None:
    """Télécharge et extrait le texte principal d'une URL. Retourne None si échec."""
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        return None
    text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
    return text or None


def from_text(text: str) -> str:
    """Retourne le texte tel quel après nettoyage minimal."""
    return text.strip()
