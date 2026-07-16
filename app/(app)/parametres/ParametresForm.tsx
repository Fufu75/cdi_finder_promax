"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Gift,
  Loader2,
  Lock,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { saveSettings } from "./actions";
import { PROVIDERS, PROVIDER_LIST, type Provider } from "@/lib/providers";

const KEY_LINK: Record<Exclude<Provider, "free">, string> = {
  anthropic: "https://console.anthropic.com/settings/keys",
  openai: "https://platform.openai.com/api-keys",
  gemini: "https://aistudio.google.com/apikey",
};

export default function ParametresForm({
  initialProvider,
  initialModel,
  keys,
}: {
  initialProvider: Provider;
  initialModel: string;
  keys: Record<Provider, { hasKey: boolean; last4: string | null }>;
}) {
  const [provider, setProvider] = useState<Provider>(initialProvider);
  const [model, setModel] = useState(initialModel);
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function switchProvider(p: Provider) {
    setProvider(p);
    setModel(p === initialProvider ? initialModel : PROVIDERS[p].defaultModel);
    setStatus(null);
  }

  async function action(formData: FormData) {
    setSaving(true);
    setStatus(null);
    const res = await saveSettings(formData);
    setStatus(res);
    setSaving(false);
    if (res.ok) {
      const el = document.getElementById("apiKey") as HTMLInputElement | null;
      if (el) el.value = "";
    }
  }

  const info = PROVIDERS[provider];
  const k = keys[provider];

  return (
    <form action={action} className="max-w-xl space-y-7">
      <input type="hidden" name="provider" value={provider} />

      {/* Fournisseur */}
      <div>
        <p className="label">Fournisseur d&apos;IA</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PROVIDER_LIST.map((p) => {
            const actif = provider === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => switchProvider(p)}
                aria-pressed={actif}
                className={`flex items-center justify-between gap-2 rounded-xl border p-4 text-left transition ${
                  actif
                    ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-500"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <span
                  className={`text-sm font-medium ${actif ? "text-brand-800" : "text-stone-700"}`}
                >
                  {PROVIDERS[p].label}
                </span>
                {p === "free" ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                    <Gift size={11} />
                    gratuit
                  </span>
                ) : (
                  keys[p].hasKey && (
                    <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clé API — sauf en gratuit, où la clé est côté serveur. */}
      {provider === "free" ? (
        <div className="space-y-2.5">
          <div className="alert-success">
            <Gift size={17} className="mt-0.5 shrink-0" />
            <p>
              <strong className="font-semibold">Accès gratuit</strong> — aucune clé
              nécessaire. Les documents sont générés par des modèles open-source (Llama,
              gpt-oss) hébergés sur Groq.
            </p>
          </div>
          {!k.hasKey && (
            <div className="alert-warn">
              <TriangleAlert size={17} className="mt-0.5 shrink-0" />
              <p>Mode gratuit non configuré côté serveur (clé Groq manquante).</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="label" htmlFor="apiKey">
            Clé API — {info.label}
          </label>
          {k.hasKey && (
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm text-brand-700">
              <CheckCircle2 size={15} />
              Clé enregistrée (…{k.last4}). Laisse vide pour la conserver.
            </p>
          )}
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute inset-y-0 left-3.5 my-auto text-stone-400"
            />
            <input
              id="apiKey"
              type="password"
              name="apiKey"
              autoComplete="off"
              placeholder={k.hasKey ? "Saisir une nouvelle clé (optionnel)" : info.keyHint}
              className="field pl-10 font-mono"
            />
          </div>
          <p className="hint flex items-center gap-1.5">
            <ShieldCheck size={13} className="shrink-0 text-brand-600" />
            Chiffrée avant stockage. À créer sur{" "}
            <a
              href={KEY_LINK[provider]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-stone-700 underline underline-offset-2 hover:text-brand-700"
            >
              {new URL(KEY_LINK[provider]).host}
              <ExternalLink size={11} />
            </a>
          </p>
        </div>
      )}

      {/* Modèle */}
      <div>
        <label className="label" htmlFor="model">
          Modèle
        </label>
        <input
          id="model"
          name="model"
          list={`models-${provider}`}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="field font-mono"
        />
        <datalist id={`models-${provider}`}>
          {info.models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {info.models.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModel(m)}
              className={`rounded-lg px-2 py-1 font-mono text-xs transition ${
                model === m
                  ? "bg-brand-100 text-brand-800"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {status?.error && (
        <div className="alert-error">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{status.error}</p>
        </div>
      )}
      {status?.ok && (
        <div className="alert-success">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <p>Paramètres enregistrés.</p>
        </div>
      )}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
