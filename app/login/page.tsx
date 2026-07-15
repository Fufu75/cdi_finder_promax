import AuthForm from "./AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">CDI Finder</h1>
          <p className="text-slate-500 mt-2">
            Ton agent de candidature : CV adapté + lettre de motivation.
          </p>
        </div>

        <AuthForm error={error} message={message} />

        <p className="text-center text-xs text-slate-400 mt-6">
          Chaque compte utilise sa propre clé API Anthropic (chiffrée).
        </p>
      </div>
    </div>
  );
}
