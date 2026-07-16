import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Mail,
  StickyNote,
  Target,
  type LucideIcon,
} from "lucide-react";
import { getCandidature } from "@/lib/data";
import { deleteCandidature } from "../actions";
import StatutSelect from "./StatutSelect";
import StatutBadge from "@/components/StatutBadge";

export const dynamic = "force-dynamic";

function Section({
  titre,
  icon: Icon,
  children,
}: {
  titre: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="section-title">
        <span className="section-icon">
          <Icon size={15} />
        </span>
        {titre}
      </h2>
      {children}
    </section>
  );
}

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
    <div className="animate-fade-up">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-stone-900"
      >
        <ArrowLeft size={15} />
        Retour aux candidatures
      </Link>

      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          {c.poste ?? "Poste"}
        </h1>
        <p className="mt-1.5 text-sm text-stone-500">
          {[c.entreprise, c.lieu, c.type_contrat].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>

      {/* Statut — l'action principale du suivi, donc mise en avant. */}
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-stone-700">Statut</span>
          <StatutBadge statut={c.statut} />
        </div>
        <StatutSelect id={c.id} current={c.statut} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2.5">
        {cv && (
          <a href={`/api/candidatures/${c.id}/cv`} className="btn-primary">
            <Download size={16} />
            CV (.docx)
          </a>
        )}
        {c.lettre && (
          <a href={`/api/candidatures/${c.id}/lettre`} className="btn-secondary">
            <Download size={16} />
            Lettre (.docx)
          </a>
        )}
        {c.lien_offre && (
          <a
            href={c.lien_offre}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <ExternalLink size={16} />
            Voir l'offre
          </a>
        )}
      </div>

      {c.notes && (
        <div className="alert-info mb-8">
          <StickyNote size={17} className="mt-0.5 shrink-0 text-stone-400" />
          <p>{c.notes}</p>
        </div>
      )}

      {cv && (
        <Section titre="CV adapté" icon={FileText}>
          <div className="card space-y-5 p-6">
            <p className="font-medium text-brand-700">{cv.titre_cv}</p>
            {cv.resume && (
              <p className="text-sm leading-relaxed text-stone-600">{cv.resume}</p>
            )}
            {cv.experiences?.map((exp, i) => (
              <div key={i} className="border-t border-stone-100 pt-4 first:border-0 first:pt-0">
                <p className="font-medium text-stone-800">
                  {[exp.intitule, exp.entreprise].filter(Boolean).join(" — ")}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {[exp.lieu, exp.periode].filter(Boolean).join(" · ")}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-stone-600">
                  {exp.missions?.map((m, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {c.lettre && (
        <Section titre="Lettre de motivation" icon={Mail}>
          <div className="card whitespace-pre-wrap p-6 text-sm leading-relaxed text-stone-700">
            {c.lettre}
          </div>
        </Section>
      )}

      {offre && (
        <Section titre="Analyse de l'offre" icon={Target}>
          <div className="card space-y-4 p-6 text-sm text-stone-700">
            {offre.mots_cles_ats?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {offre.mots_cles_ats.map((k, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : null}
            {offre.profil_recherche && (
              <p className="leading-relaxed">
                <span className="font-medium text-stone-900">Profil recherché : </span>
                {offre.profil_recherche}
              </p>
            )}
          </div>
        </Section>
      )}

      <form
        className="border-t border-stone-200 pt-6"
        action={async () => {
          "use server";
          await deleteCandidature(c.id);
        }}
      >
        <button className="btn-danger -ml-4">Supprimer cette candidature</button>
      </form>
    </div>
  );
}
