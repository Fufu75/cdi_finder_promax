"use client";

import { useState } from "react";
import { login, signup } from "./actions";

export default function AuthForm({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      {/* Choix : connexion / inscription */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "login" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "signup" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Créer un compte
        </button>
      </div>

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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Au moins 6 caractères"
          />
        </div>

        <button
          type="submit"
          formAction={mode === "login" ? login : signup}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 transition"
        >
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-4">
        {mode === "login"
          ? "Pas encore de compte ? Clique sur « Créer un compte » ci-dessus."
          : "Remplis l'e-mail et le mot de passe, puis clique sur « Créer mon compte »."}
      </p>
    </div>
  );
}
