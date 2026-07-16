import { createClient } from "@/lib/supabase/server";
import { getCandidaturesCount, getSettings } from "@/lib/data";
import { logout } from "@/app/login/actions";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [{ data: { user } }, settings, nbCandidatures] = await Promise.all([
    supabase.auth.getUser(),
    getSettings(),
    getCandidaturesCount(),
  ]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        email={user?.email ?? null}
        provider={settings.provider}
        model={settings.model}
        nbCandidatures={nbCandidatures}
        logout={logout}
      />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">{children}</div>
      </main>
    </div>
  );
}
