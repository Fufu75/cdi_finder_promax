import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

const NAV = [
  { href: "/dashboard", label: "Candidatures", icon: "📋" },
  { href: "/nouvelle", label: "Nouvelle", icon: "✨" },
  { href: "/profil", label: "Mon profil", icon: "👤" },
  { href: "/parametres", label: "Paramètres", icon: "⚙️" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex">
      {/* Barre latérale */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">
            CDI Finder
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <p className="px-3 py-1 text-xs text-slate-400 truncate">{user?.email}</p>
          <form action={logout}>
            <button className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
