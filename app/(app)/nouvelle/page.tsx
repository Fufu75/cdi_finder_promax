import { getSettings } from "@/lib/data";
import NouvelleForm from "./NouvelleForm";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function NouvellePage() {
  const settings = await getSettings();
  return (
    <div className="animate-fade-up">
      <PageHeader
        titre="Nouvelle candidature"
        sous_titre="Colle une offre : l'agent en tire un CV adapté (ATS) et une lettre de motivation."
      />
      <NouvelleForm hasKey={settings.hasKey} />
    </div>
  );
}
