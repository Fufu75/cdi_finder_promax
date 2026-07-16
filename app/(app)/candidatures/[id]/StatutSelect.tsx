"use client";

import { useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
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
    <div className="flex items-center gap-2">
      <label htmlFor="statut" className="text-xs text-stone-500">
        Mettre à jour
      </label>
      <div className="relative">
        <select
          id="statut"
          defaultValue={current}
          disabled={pending}
          onChange={(e) => start(() => updateStatut(id, e.target.value as Statut))}
          className="field cursor-pointer appearance-none py-2 pr-9 font-medium shadow-sm disabled:opacity-50"
        >
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {statutLabel(s)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2.5 grid place-items-center text-stone-400">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
        </span>
      </div>
    </div>
  );
}
