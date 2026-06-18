import os
import anthropic
from dotenv import load_dotenv

load_dotenv()


def get_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "ANTHROPIC_API_KEY non définie. "
            "Exécute : export ANTHROPIC_API_KEY='sk-...'"
        )
    return anthropic.Anthropic(api_key=api_key)
