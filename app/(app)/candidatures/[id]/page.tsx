import Link from "next/link";
import { notFound } from "next/navigation";
import { getCandidature } from "@/lib/data";
import { deleteCandidature } from "../actions";
import StatutSelect from "./StatutSelect";

export const dynamic = "force-dynamic";

export default async function CandidaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getCandidature(id);
  if (!c) notFound();

  const offre = c.offre_analysee;
  const cv = c.cv_data;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
        ← Retour aux candidatures
      </Link>

      <div className="flex items-start justify-between mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {c.poste ?? "Poste"}
          </h1>
          <p className="text-slate-500 mt-1">
            {[c.entreprise, c.lieu, c.type_contrat].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <StatutSelect id={c.id} current={c.statut} />
      </div>

      {/* Téléchargements */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href={`/api/candidatures/${c.id}/cv`}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition"
        >
          ⬇️ Télécharger le CV (.docx)
        </a>
        <a
          href={`/api/candidatures/${c.id}/lettre`}
          className="rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50 transition"
        >
          ⬇️ Télécharger la lettre (.docx)
        </a>
        {c.lien_offre && (
          <a
            href={c.lien_offre}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            🔗 Voir l'offre
          </a>
        )}
      </div>

      {c.notes && (
        <div className="mb-8 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          <span className="font-medium">Notes :</span> {c.notes}
        </div>
      )}

      {/* CV adapté */}
      {cv && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">CV adapté</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <p className="font-medium text-brand-700">{cv.titre_cv}</p>
            {cv.resume && <p className="text-sm text-slate-600">{cv.resume}</p>}
            {cv.experiences?.map((exp, i) => (
              <div key={i}>
                <p className="font-medium text-slate-800">
                  {[exp.intitule, exp.entreprise].filter(Boolean).join(" — ")}
                </p>
                <p className="text-xs text-slate-400">
                  {[exp.lieu, exp.periode].filter(Boolean).join(" · ")}
                </p>
                <ul className="mt-1 list-disc list-inside text-sm text-slate-600 space-y-0.5">
                  {exp.missions?.map((m, j) => <li key={j}>{m}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lettre */}
      {c.lettre && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Lettre de motivation
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
            {c.lettre}
          </div>
        </section>
      )}

      {/* Analyse de l'offre */}
      {offre && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Analyse de l'offre
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 space-y-2">
            {offre.mots_cles_ats?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {offre.mots_cles_ats.map((k, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-xs"
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : null}
            {offre.profil_recherche && (
              <p>
                <span className="font-medium">Profil recherché :</span>{" "}
                {offre.profil_recherche}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Suppression */}
      <form
        action={async () => {
          "use server";
          await deleteCandidature(c.id);
        }}
      >
        <button className="text-sm text-red-600 hover:text-red-800 hover:underline">
          Supprimer cette candidature
        </button>
      </form>
    </div>
  );
}
