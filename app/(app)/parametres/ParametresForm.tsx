"use client";

import { useState } from "react";
import { saveSettings } from "./actions";

const MODELS = [
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 — le plus performant (recommandé)" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 — bon rapport qualité / coût" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — le plus rapide et économique" },
];

export default function ParametresForm({
  hasKey,
  keyLast4,
  model,
}: {
  hasKey: boolean;
  keyLast4: string | null;
  model: string;
}) {
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function action(formData: FormData) {
    setSaving(true);
    setStatus(null);
    const res = await saveSettings(formData);
    setStatus(res);
    setSaving(false);
    if (res.ok) (document.getElementById("apiKey") as HTMLInputElement).value = "";
  }

  return (
    <form action={action} className="space-y-6 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Clé API Anthropic
        </label>
        {hasKey && (
          <p className="text-sm text-green-700 mb-2">
            ✅ Une clé est enregistrée (se terminant par « …{keyLast4} »). Laisse vide
            pour la conserver.
          </p>
        )}
        <input
          id="apiKey"
          type="password"
          name="apiKey"
          autoComplete="off"
          placeholder={hasKey ? "Saisir une nouvelle clé (optionnel)" : "sk-ant-..."}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
        />
        <p className="text-xs text-slate-400 mt-1">
          Obtiens-la sur{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            console.anthropic.com
          </a>
          . Elle est chiffrée avant d'être stockée.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
        <select
          name="model"
          defaultValue={model}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
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
