import { login, signup } from "./actions";

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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="toi@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                formAction={login}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 transition"
              >
                Se connecter
              </button>
              <button
                formAction={signup}
                className="flex-1 rounded-lg border border-brand-600 px-4 py-2.5 font-medium text-brand-700 hover:bg-brand-50 transition"
              >
                Créer un compte
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Chaque compte utilise sa propre clé API Anthropic (chiffrée).
        </p>
      </div>
    </div>
  );
}
