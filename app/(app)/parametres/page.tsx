import { getSettings } from "@/lib/data";
import ParametresForm from "./ParametresForm";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const settings = await getSettings();
  return (
    <div className="animate-fade-up">
      <PageHeader
        titre="Paramètres"
        sous_titre="Choisis ton fournisseur d'IA et le modèle qui génère tes documents."
      />
      <ParametresForm
        initialProvider={settings.provider}
        initialModel={settings.model}
        keys={settings.keys}
      />
    </div>
  );
}
