"use client";

import { useState } from "react";
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

export default function ProfilForm({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    const res = await saveProfil(value);
    setStatus(res);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Tes données réelles au format JSON. L'agent ne s'en sert que pour sélectionner et
          reformuler — il n'inventera jamais d'expérience.
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
  );
}
