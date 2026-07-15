"use client";

import { useTransition } from "react";
import { updateStatut } from "../actions";
import { STATUTS, statutLabel } from "@/components/StatutBadge";
import type { Statut } from "@/lib/types";

export default function StatutSelect({
  id,
  current,
}: {
  id: string;
  current: Statut;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      defaultValue={current}
      disabled={pending}
      onChange={(e) => start(() => updateStatut(id, e.target.value as Statut))}
      className="rounded-lg border-2 border-brand-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-400 transition disabled:opacity-50 cursor-pointer"
    >
      {STATUTS.map((s) => (
        <option key={s} value={s}>
          {statutLabel(s)}
        </option>
      ))}
    </select>
  );
}
