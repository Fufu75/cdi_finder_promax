import Link from "next/link";
import { ArrowRight, FileWarning, Inbox, Sparkles } from "lucide-react";
import { getCandidatures, getSettings } from "@/lib/data";
import StatutBadge from "@/components/StatutBadge";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [candidatures, settings] = await Promise.all([
    getCandidatures(),
    getSettings(),
  ]);

  const n = candidatures.length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        titre="Mes candidatures"
        sous_titre={n === 0 ? "Aucune candidature." : `${n} candidature${n > 1 ? "s" : ""}.`}
        action={
          <Link href="/nouvelle" className="btn-primary">
            <Sparkles size={16} strokeWidth={2.2} />
            Nouvelle candidature
          </Link>
        }
      />

      {!settings.hasKey && (
        <div className="alert-warn mb-6">
          <FileWarning size={17} className="mt-0.5 shrink-0" />
          <p>
            Aucun fournisseur d'IA configuré.{" "}
            <Link href="/parametres" className="font-semibold underline underline-offset-2">
              Ouvre les Paramètres
            </Link>{" "}
            — l'accès gratuit ne demande aucune clé.
          </p>
        </div>
      )}

      {n === 0 ? (
        <div className="card grid place-items-center px-6 py-16 text-center">
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400">
            <Inbox size={22} />
          </span>
          <p className="font-medium text-stone-800">Rien ici pour l'instant</p>
          <p className="mt-1 max-w-sm text-sm text-stone-500">
            Colle ta première offre : l'agent en tire un CV adapté et une lettre de
            motivation.
          </p>
          <Link href="/nouvelle" className="btn-primary mt-6">
            <Sparkles size={16} strokeWidth={2.2} />
            Créer la première
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {candidatures.map((c) => (
            <Link
              key={c.id}
              href={`/candidatures/${c.id}`}
              className="card group flex items-center gap-4 px-5 py-4 transition hover:border-brand-300 hover:shadow-lift"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">
                  {c.poste ?? "Poste non défini"}
                </p>
                <p className="mt-0.5 truncate text-sm text-stone-500">
                  {[c.entreprise, c.lieu].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatutBadge statut={c.statut} />
                <span className="hidden text-xs tabular-nums text-stone-400 sm:block">
                  {new Date(c.created_at).toLocaleDateString("fr-FR")}
                </span>
                <ArrowRight
                  size={16}
                  className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
