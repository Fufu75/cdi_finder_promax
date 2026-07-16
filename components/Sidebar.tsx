"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Compass,
  Gift,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon: typeof Briefcase;
  badge?: number;
};

const GROUPES: { titre: string; items: Item[] }[] = [
  {
    titre: "Suivi",
    items: [
      { href: "/dashboard", label: "Candidatures", icon: Briefcase },
      { href: "/profil", label: "Mon profil", icon: UserRound },
    ],
  },
  {
    titre: "Configuration",
    items: [{ href: "/parametres", label: "Paramètres", icon: Settings }],
  },
];

function initiales(email: string | null): string {
  const nom = email?.split("@")[0] ?? "";
  const bouts = nom.split(/[._-]+/).filter(Boolean);
  const s = bouts.length > 1 ? bouts[0][0] + bouts[1][0] : nom.slice(0, 2);
  return s.toUpperCase() || "?";
}

export default function Sidebar({
  email,
  provider,
  model,
  nbCandidatures,
  logout,
}: {
  email: string | null;
  provider: string;
  model: string;
  nbCandidatures: number;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const estActif = (href: string) =>
    pathname === href ||
    // Le détail d'une candidature reste dans l'onglet « Candidatures ».
    (href === "/dashboard" && pathname.startsWith("/candidatures"));

  const contenu = (
    <>
      {/* Marque */}
      <Link href="/dashboard" onClick={close} className="flex items-center gap-2.5 px-1">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-brand ring-1 ring-inset ring-white/20">
          <Compass size={19} strokeWidth={2.2} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-stone-900">
          CDI Finder
        </span>
      </Link>

      {/* Action principale */}
      <Link
        href="/nouvelle"
        onClick={close}
        className={`mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
          estActif("/nouvelle")
            ? "bg-brand-700 text-white shadow-brand"
            : "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-brand hover:from-brand-600 hover:to-brand-700"
        }`}
      >
        <Sparkles size={16} strokeWidth={2.2} />
        Nouvelle candidature
      </Link>

      {/* Navigation */}
      <nav className="mt-7 flex-1 space-y-6">
        {GROUPES.map((groupe) => (
          <div key={groupe.titre}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              {groupe.titre}
            </p>
            <div className="space-y-0.5">
              {groupe.items.map(({ href, label, icon: Icon }) => {
                const actif = estActif(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    aria-current={actif ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      actif
                        ? "bg-brand-50 text-brand-900 ring-1 ring-inset ring-brand-100"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    {/* Repère d'onglet actif */}
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-600 transition-all ${
                        actif ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <Icon
                      size={18}
                      strokeWidth={actif ? 2.4 : 2}
                      className={
                        actif
                          ? "text-brand-600"
                          : "text-stone-400 transition group-hover:text-stone-600"
                      }
                    />
                    <span className="flex-1">{label}</span>
                    {href === "/dashboard" && nbCandidatures > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums transition ${
                          actif
                            ? "bg-brand-100 text-brand-700"
                            : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
                        }`}
                      >
                        {nbCandidatures}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Fournisseur actif */}
      <Link
        href="/parametres"
        onClick={close}
        className="mt-6 flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 transition hover:border-stone-300 hover:bg-white"
      >
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
            provider === "free" ? "bg-brand-100 text-brand-700" : "bg-stone-200 text-stone-600"
          }`}
        >
          <Gift size={13} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-stone-700">
            {provider === "free" ? "Accès gratuit" : "Clé personnelle"}
          </span>
          <span className="block truncate font-mono text-[10px] text-stone-400">{model}</span>
        </span>
      </Link>

      {/* Compte */}
      <div className="mt-2.5 flex items-center gap-2.5 rounded-xl px-1 py-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-stone-700 to-stone-900 text-[11px] font-semibold text-white">
          {initiales(email)}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-stone-500">{email}</span>
        <form action={logout}>
          <button
            title="Se déconnecter"
            aria-label="Se déconnecter"
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
          >
            <LogOut size={15} />
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Barre mobile */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-1.5 text-stone-600 transition hover:bg-stone-100"
        >
          <Menu size={20} />
        </button>
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-brand">
          <Compass size={15} strokeWidth={2.2} />
        </span>
        <span className="flex-1 text-sm font-semibold text-stone-900">CDI Finder</span>
        <Link
          href="/nouvelle"
          className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-brand"
          aria-label="Nouvelle candidature"
        >
          <Sparkles size={15} strokeWidth={2.2} />
        </Link>
      </header>

      {/* Tiroir mobile */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Fermer le menu"
            onClick={close}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[17rem] animate-slide-in flex-col border-r border-stone-200 bg-white p-4 shadow-lift">
            <button
              onClick={close}
              aria-label="Fermer le menu"
              className="absolute right-3 top-3 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100"
            >
              <X size={18} />
            </button>
            {contenu}
          </aside>
        </div>
      )}

      {/* Barre latérale desktop */}
      <aside className="sticky top-0 hidden h-screen w-[16.5rem] shrink-0 flex-col border-r border-stone-200 bg-white p-4 md:flex">
        {contenu}
      </aside>
    </>
  );
}
