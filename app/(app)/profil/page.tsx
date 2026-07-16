import { getProfil, getSettings } from "@/lib/data";
import ProfilForm from "./ProfilForm";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const [profil, settings] = await Promise.all([getProfil(), getSettings()]);
  const initial =
    profil && Object.keys(profil).length > 0
      ? JSON.stringify(profil, null, 2)
      : "{}";

  return (
    <div className="animate-fade-up">
      <PageHeader
        titre="Mon profil"
        sous_titre="Tes expériences, formations et compétences réelles — la seule matière que l'agent utilise."
      />
      <ProfilForm initial={initial} hasKey={settings.hasKey} />
    </div>
  );
}
