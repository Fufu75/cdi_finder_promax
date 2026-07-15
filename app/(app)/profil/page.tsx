import { getProfil } from "@/lib/data";
import ProfilForm from "./ProfilForm";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const profil = await getProfil();
  const initial =
    profil && Object.keys(profil).length > 0
      ? JSON.stringify(profil, null, 2)
      : "{}";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mon profil</h1>
      <p className="text-slate-500 mb-8">
        Tes expériences, formations et compétences réelles.
      </p>
      <ProfilForm initial={initial} />
    </div>
  );
}
