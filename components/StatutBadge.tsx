import type { Statut } from "@/lib/types";

const STYLES: Record<Statut, { label: string; cls: string; dot: string }> = {
  brouillon: {
    label: "Brouillon",
    cls: "bg-stone-100 text-stone-600 ring-stone-200",
    dot: "bg-stone-400",
  },
  envoyee: {
    label: "Envoyée",
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
  },
  entretien: {
    label: "Entretien",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  refus: {
    label: "Refus",
    cls: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  offre: {
    label: "Offre",
    cls: "bg-brand-50 text-brand-800 ring-brand-200",
    dot: "bg-brand-500",
  },
};

export const STATUTS: Statut[] = ["brouillon", "envoyee", "entretien", "refus", "offre"];

export function statutLabel(s: Statut): string {
  return STYLES[s]?.label ?? s;
}

export default function StatutBadge({ statut }: { statut: Statut }) {
  const s = STYLES[statut] ?? STYLES.brouillon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
