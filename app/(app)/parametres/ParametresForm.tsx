"use client";

import { useState } from "react";
import { saveSettings } from "./actions";
import { PROVIDERS, PROVIDER_LIST, type Provider } from "@/lib/providers";

const KEY_LINK: Record<Provider, string> = {
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
    <form action={action} className="space-y-6 max-w-xl">
      <input type="hidden" name="provider" value={provider} />

      {/* Fournisseur */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Fournisseur d'IA
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PROVIDER_LIST.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => switchProvider(p)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                provider === p
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {PROVIDERS[p].label}
              {keys[p].hasKey && <span className="ml-1 text-green-600">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Clé API */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Clé API — {info.label}
        </label>
        {k.hasKey && (
          <p className="text-sm text-green-700 mb-2">
            ✅ Clé enregistrée (se terminant par « …{k.last4} »). Laisse vide pour la conserver.
          </p>
        )}
        <input
          id="apiKey"
          type="password"
          name="apiKey"
          autoComplete="off"
          placeholder={k.hasKey ? "Saisir une nouvelle clé (optionnel)" : info.keyHint}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
        />
        <p className="text-xs text-slate-400 mt-1">
          Obtiens-la sur{" "}
          <a href={KEY_LINK[provider]} target="_blank" rel="noopener noreferrer" className="underline">
            {new URL(KEY_LINK[provider]).host}
          </a>
          . Elle est chiffrée avant d'être stockée.
        </p>
      </div>

      {/* Modèle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
        <input
          name="model"
          list={`models-${provider}`}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
        />
        <datalist id={`models-${provider}`}>
          {info.models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        <p className="text-xs text-slate-400 mt-1">
          Suggestions : {info.models.join(", ")}. Tu peux saisir un autre modèle disponible sur
          ton compte.
        </p>
      </div>

      {status?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {status.error}
        </div>
      )}
      {status?.ok && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Paramètres enregistrés.
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 transition disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
