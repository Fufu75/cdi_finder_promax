"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ClipboardType,
  FileText,
  Link2,
  Loader2,
  Mail,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

type Mode = "url" | "texte";

/** Case à cocher présentée comme une carte cliquable. */
function DocToggle({
  checked,
  onChange,
  icon: Icon,
  titre,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: typeof FileText;
  titre: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex flex-1 items-start gap-3 rounded-xl border p-4 text-left transition ${
        checked
          ? "border-brand-500 bg-brand-50/60 ring-1 ring-brand-500"
          : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
      }`}
    >
      <Icon
        size={18}
        className={`mt-0.5 shrink-0 ${checked ? "text-brand-600" : "text-stone-400"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-stone-900">{titre}</p>
        <p className="mt-0.5 text-xs text-stone-500">{desc}</p>
      </div>
      <span
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md border transition ${
          checked ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3.5} />}
      </span>
    </button>
  );
}

export default function NouvelleForm({ hasKey }: { hasKey: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("texte");
  const [url, setUrl] = useState("");
  const [texte, setTexte] = useState("");
  const [notes, setNotes] = useState("");
  const [produireCv, setProduireCv] = useState(true);
  const [produireLettre, setProduireLettre] = useState(true);
  const [langue, setLangue] = useState<"fr" | "en">("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!produireCv && !produireLettre) {
      setError("Choisis au moins un document à générer.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, url, texte, notes, produireCv, produireLettre, langue }),
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

  const libelle = loading
    ? "Génération en cours… (30-60 s)"
    : produireCv && produireLettre
      ? "Générer le CV et la lettre"
      : produireCv
        ? "Générer le CV"
        : "Générer la lettre";

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {!hasKey && (
        <div className="alert-warn">
          <TriangleAlert size={17} className="mt-0.5 shrink-0" />
          <p>
            Aucun fournisseur d'IA configuré.{" "}
            <Link href="/parametres" className="font-semibold underline underline-offset-2">
              Ouvre les Paramètres
            </Link>{" "}
            — l'accès gratuit ne demande aucune clé.
          </p>
        </div>
      )}

      {/* Source de l'offre */}
      <div>
        <p className="label">L&apos;offre</p>
        <div className="segmented mb-3">
          {(
            [
              { m: "texte" as Mode, icon: ClipboardType, label: "Coller le texte" },
              { m: "url" as Mode, icon: Link2, label: "Depuis une URL" },
            ]
          ).map(({ m, icon: Icon, label }) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`segmented-item ${mode === m ? "segmented-item-active" : ""}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {mode === "url" ? (
          <>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="field"
            />
            <p className="hint">
              LinkedIn et Indeed bloquent souvent la lecture : dans ce cas, colle le texte.
            </p>
          </>
        ) : (
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={12}
            placeholder="Colle ici le texte complet de l'offre…"
            className="field resize-y leading-relaxed"
          />
        )}
      </div>

      {/* Documents */}
      <div>
        <p className="label">Documents à générer</p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <DocToggle
            checked={produireCv}
            onChange={setProduireCv}
            icon={FileText}
            titre="CV adapté"
            desc="Reformulé sur les mots-clés de l'offre"
          />
          <DocToggle
            checked={produireLettre}
            onChange={setProduireLettre}
            icon={Mail}
            titre="Lettre de motivation"
            desc="Personnalisée pour l'entreprise"
          />
        </div>
      </div>

      {/* Langue */}
      <div>
        <p className="label">Langue des documents</p>
        <div className="segmented">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLangue(l)}
              className={`segmented-item ${langue === l ? "segmented-item-active" : ""}`}
            >
              {l === "fr" ? "Français" : "English"}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label" htmlFor="notes">
          Notes <span className="font-normal text-stone-400">(optionnel)</span>
        </label>
        <input
          id="notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex : candidature prioritaire, relancer le 15…"
          className="field"
        />
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading || !hasKey} className="btn-primary w-full sm:w-auto">
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} strokeWidth={2.2} />
        )}
        {libelle}
      </button>
    </form>
  );
}
