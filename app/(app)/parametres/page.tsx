import { getSettings } from "@/lib/data";
import ParametresForm from "./ParametresForm";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Paramètres</h1>
      <p className="text-slate-500 mb-8">
        Ta clé API Anthropic et le modèle utilisé pour générer tes documents.
      </p>
      <ParametresForm
        hasKey={settings.hasKey}
        keyLast4={settings.keyLast4}
        model={settings.model}
      />
    </div>
  );
}
