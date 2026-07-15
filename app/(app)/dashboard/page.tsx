import Link from "next/link";
import { getCandidatures, getSettings } from "@/lib/data";
import StatutBadge from "@/components/StatutBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [candidatures, settings] = await Promise.all([
    getCandidatures(),
    getSettings(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes candidatures</h1>
          <p className="text-slate-500 mt-1">
            {candidatures.length} candidature{candidatures.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Link
          href="/nouvelle"
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 transition"
        >
          ✨ Nouvelle candidature
        </Link>
      </div>

      {!settings.hasKey && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Tu n'as pas encore renseigné ta clé API Anthropic.{" "}
          <Link href="/parametres" className="font-semibold underline">
            Ajoute-la dans Paramètres
          </Link>{" "}
          pour pouvoir générer des documents.
        </div>
      )}

      {candidatures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-slate-400">Aucune candidature pour l'instant.</p>
          <Link
            href="/nouvelle"
            className="inline-block mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Créer la première
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {candidatures.map((c) => (
            <Link
              key={c.id}
              href={`/candidatures/${c.id}`}
              className="block rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-brand-300 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {c.poste ?? "Poste non défini"}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {[c.entreprise, c.lieu].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatutBadge statut={c.statut} />
                  <span className="text-xs text-slate-400">
                    {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
