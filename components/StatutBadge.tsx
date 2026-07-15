import type { Statut } from "@/lib/types";

const STYLES: Record<Statut, { label: string; cls: string }> = {
  brouillon: { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
  envoyee: { label: "Envoyée", cls: "bg-blue-100 text-blue-700" },
  entretien: { label: "Entretien", cls: "bg-amber-100 text-amber-700" },
  refus: { label: "Refus", cls: "bg-red-100 text-red-700" },
  offre: { label: "Offre !", cls: "bg-green-100 text-green-700" },
};

export const STATUTS: Statut[] = ["brouillon", "envoyee", "entretien", "refus", "offre"];

export function statutLabel(s: Statut): string {
  return STYLES[s]?.label ?? s;
}

export default function StatutBadge({ statut }: { statut: Statut }) {
  const s = STYLES[statut] ?? STYLES.brouillon;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
