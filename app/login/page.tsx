import { Compass, Gift } from "lucide-react";
import AuthForm from "./AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <Compass size={24} strokeWidth={2.2} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            CDI Finder
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Colle une offre, récupère un CV adapté et une lettre de motivation.
          </p>
        </div>

        <AuthForm error={error} message={message} />

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-400">
          <Gift size={13} className="text-brand-600" />
          Accès gratuit inclus — ou utilise ta propre clé API, chiffrée.
        </p>
      </div>
    </div>
  );
}
