// Métadonnées des fournisseurs LLM — sûr côté client (aucun SDK importé ici).

export type Provider = "anthropic" | "openai" | "gemini";

export const PROVIDERS: Record<
  Provider,
  { label: string; keyPrefix: string; keyHint: string; defaultModel: string; models: string[] }
> = {
  anthropic: {
    label: "Anthropic (Claude)",
    keyPrefix: "sk-ant-",
    keyHint: "sk-ant-…",
    defaultModel: "claude-opus-4-8",
    models: ["claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5"],
  },
  openai: {
    label: "OpenAI (GPT)",
    keyPrefix: "sk-",
    keyHint: "sk-…",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"],
  },
  gemini: {
    label: "Google (Gemini)",
    keyPrefix: "",
    keyHint: "AIza…",
    defaultModel: "gemini-2.0-flash",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
  },
};

export const PROVIDER_LIST: Provider[] = ["anthropic", "openai", "gemini"];

export function isProvider(v: unknown): v is Provider {
  return v === "anthropic" || v === "openai" || v === "gemini";
}
