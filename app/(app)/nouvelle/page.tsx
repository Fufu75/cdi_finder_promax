import { getSettings } from "@/lib/data";
import NouvelleForm from "./NouvelleForm";

export const dynamic = "force-dynamic";

export default async function NouvellePage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Nouvelle candidature</h1>
      <p className="text-slate-500 mb-8">
        Colle une offre, l'agent génère un CV adapté (ATS) et une lettre de motivation.
      </p>
      <NouvelleForm hasKey={settings.hasKey} />
    </div>
  );
}
