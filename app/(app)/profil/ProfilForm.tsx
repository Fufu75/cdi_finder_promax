"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Loader2,
  Sparkles,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { saveProfil } from "./actions";

const TEMPLATE = {
  identite: {
    prenom: "",
    nom: "",
    titre_courant: "",
    email: "",
    telephone: "",
    ville: "",
    linkedin: "",
    github: "",
  },
  formations: [
    { diplome: "", etablissement: "", lieu: "", date_debut: "", date_fin: "", description: "" },
  ],
  experiences: [
    {
      intitule: "",
      entreprise: "",
      lieu: "",
      date_debut: "",
      date_fin: "",
      missions: [""],
      competences_cles: [""],
    },
  ],
  projets: [{ titre: "", technologies: [""], description: "" }],
  competences: { langages_programmation: [""], data_ia: [""], cloud: [""], autres_outils: [""] },
  langues: [{ langue: "", niveau: "" }],
  interets: [""],
};

export default function ProfilForm({
  initial,
  hasKey,
}: {
  initial: string;
  hasKey: boolean;
}) {
  const [tab, setTab] = useState<"import" | "json">("import");
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Import CV
  const [cvTexte, setCvTexte] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [imported, setImported] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    const res = await saveProfil(value);
    setStatus(res);
    setSaving(false);
  }

  async function extractFrom(payload: FormData | { texte: string }) {
    setExtracting(true);
    setImportError(null);
    setImported(false);
    try {
      const res = await fetch("/api/profil/extraire", {
        method: "POST",
        ...(payload instanceof FormData
          ? { body: payload }
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Échec de l'extraction.");
        return;
      }
      setValue(JSON.stringify(data.profil, null, 2));
      setImported(true);
      setTab("json"); // on bascule vers l'éditeur pour relecture
    } catch {
      setImportError("Erreur réseau.");
    } finally {
      setExtracting(false);
    }
  }

  function handleFile() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setImportError("Choisis un fichier d'abord.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    extractFrom(fd);
  }

  return (
    <div>
      <div className="segmented mb-6">
        {(
          [
            { t: "import" as const, icon: Upload, label: "Importer mon CV" },
            { t: "json" as const, icon: Code2, label: "Éditer manuellement" },
          ]
        ).map(({ t, icon: Icon, label }) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`segmented-item ${tab === t ? "segmented-item-active" : ""}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "import" ? (
        <div className="space-y-6">
          {!hasKey && (
            <div className="alert-warn">
              <TriangleAlert size={17} className="mt-0.5 shrink-0" />
              <p>
                L&apos;extraction a besoin d&apos;un fournisseur d&apos;IA.{" "}
                <Link
                  href="/parametres"
                  className="font-semibold underline underline-offset-2"
                >
                  Ouvre les Paramètres
                </Link>{" "}
                — l&apos;accès gratuit ne demande aucune clé.
              </p>
            </div>
          )}

          <div className="card p-6">
            <p className="mb-5 text-sm leading-relaxed text-stone-600">
              Envoie ton CV (PDF ou Word) ou colle son texte : le modèle en extrait tes
              expériences, formations et compétences. Tu relis tout avant d&apos;enregistrer.
            </p>

            <label className="label" htmlFor="cv-file">
              Fichier CV <span className="font-normal text-stone-400">(PDF, DOCX, TXT)</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                id="cv-file"
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="min-w-0 flex-1 text-sm text-stone-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
              <button
                type="button"
                onClick={handleFile}
                disabled={extracting || !hasKey}
                className="btn-primary shrink-0"
              >
                {extracting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} strokeWidth={2.2} />
                )}
                {extracting ? "Extraction…" : "Extraire"}
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-stone-400">
              <span className="h-px flex-1 bg-stone-200" />
              ou colle le texte
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            <textarea
              value={cvTexte}
              onChange={(e) => setCvTexte(e.target.value)}
              rows={8}
              placeholder="Colle ici le texte de ton CV…"
              className="field resize-y leading-relaxed"
            />
            <button
              type="button"
              onClick={() => extractFrom({ texte: cvTexte })}
              disabled={extracting || !hasKey || cvTexte.trim().length < 50}
              className="btn-secondary mt-3"
            >
              {extracting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              Extraire depuis le texte
            </button>
          </div>

          {importError && (
            <div className="alert-error">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <p>{importError}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {imported && (
            <div className="alert-success">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <p>
                Profil extrait. Relis-le et corrige si besoin, puis enregistre.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm text-stone-500">
              Tes données au format JSON. L&apos;agent ne fait que sélectionner et
              reformuler — il n&apos;invente jamais rien.
            </p>
            <button
              type="button"
              onClick={() => setValue(JSON.stringify(TEMPLATE, null, 2))}
              className="btn-secondary shrink-0 px-3 py-1.5 text-xs"
            >
              Insérer un modèle vide
            </button>
          </div>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={24}
            spellCheck={false}
            className="field resize-y font-mono text-xs leading-relaxed"
          />

          {status?.error && (
            <div className="alert-error">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <p>{status.error}</p>
            </div>
          )}
          {status?.ok && (
            <div className="alert-success">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <p>Profil enregistré.</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Enregistrement…" : "Enregistrer le profil"}
          </button>
        </div>
      )}
    </div>
  );
}
