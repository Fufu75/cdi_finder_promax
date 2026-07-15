"use client";

import { useRef, useState } from "react";
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
      {/* Onglets */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 mb-6 max-w-md">
        <button
          type="button"
          onClick={() => setTab("import")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            tab === "import" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Importer mon CV
        </button>
        <button
          type="button"
          onClick={() => setTab("json")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            tab === "json" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Éditer manuellement
        </button>
      </div>

      {tab === "import" ? (
        <div className="space-y-6">
          {!hasKey && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              Ajoute d'abord ta clé API dans <strong>Paramètres</strong> pour utiliser
              l'extraction.
            </div>
          )}

          <div>
            <p className="text-sm text-slate-600 mb-3">
              Envoie ton CV (PDF ou Word) ou colle son texte : Claude en extrait
              automatiquement tes expériences, formations et compétences. Tu pourras
              tout relire avant d'enregistrer.
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fichier CV (PDF, DOCX, TXT)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-brand-700 file:font-medium hover:file:bg-brand-100"
              />
              <button
                type="button"
                onClick={handleFile}
                disabled={extracting || !hasKey}
                className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-50"
              >
                {extracting ? "Extraction…" : "Extraire"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex-1 h-px bg-slate-200" />
            ou colle le texte
            <span className="flex-1 h-px bg-slate-200" />
          </div>

          <div>
            <textarea
              value={cvTexte}
              onChange={(e) => setCvTexte(e.target.value)}
              rows={8}
              placeholder="Colle ici le texte de ton CV…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <button
              type="button"
              onClick={() => extractFrom({ texte: cvTexte })}
              disabled={extracting || !hasKey || cvTexte.trim().length < 50}
              className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-50"
            >
              {extracting ? "Extraction…" : "Extraire depuis le texte"}
            </button>
          </div>

          {importError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {importError}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {imported && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              ✅ Profil extrait. Relis-le et corrige si besoin, puis clique sur
              « Enregistrer le profil ».
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Tes données au format JSON. L'agent ne fait que sélectionner et reformuler —
              il n'invente jamais rien.
            </p>
            <button
              type="button"
              onClick={() => setValue(JSON.stringify(TEMPLATE, null, 2))}
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Insérer un modèle vide
            </button>
          </div>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={24}
            spellCheck={false}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs leading-relaxed"
          />

          {status?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {status.error}
            </div>
          )}
          {status?.ok && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Profil enregistré.
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 transition disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer le profil"}
          </button>
        </div>
      )}
    </div>
  );
}
