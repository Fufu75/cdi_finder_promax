"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "url" | "texte";

export default function NouvelleForm({ hasKey }: { hasKey: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("texte");
  const [url, setUrl] = useState("");
  const [texte, setTexte] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, url, texte, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        // Si l'URL a échoué, on bascule sur le mode texte.
        if (data.needsText) setMode("texte");
        return;
      }
      router.push(`/candidatures/${data.id}`);
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!hasKey && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Ajoute d'abord ta clé API dans <strong>Paramètres</strong>.
        </div>
      )}

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {(["texte", "url"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              mode === m ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {m === "texte" ? "Coller le texte" : "Depuis une URL"}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            URL de l'offre
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            LinkedIn et Indeed bloquent souvent la lecture : dans ce cas, colle le texte.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Texte de l'offre
          </label>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={12}
            placeholder="Colle ici le texte complet de l'offre…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes (optionnel)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex : candidature prioritaire, relancer le 15…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !hasKey}
        className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Génération en cours… (30-60 s)" : "Générer CV + Lettre"}
      </button>
    </form>
  );
}
