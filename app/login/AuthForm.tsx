"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Mail, Lock } from "lucide-react";
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
    <div className="card p-7">
      {/* Choix : connexion / inscription */}
      <div className="mb-6 flex gap-1 rounded-xl bg-stone-100 p-1">
        {(
          [
            { m: "login" as const, label: "Se connecter" },
            { m: "signup" as const, label: "Créer un compte" },
          ]
        ).map(({ m, label }) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === m
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert-error mb-4">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="alert-success mb-4">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <form className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="pointer-events-none absolute inset-y-0 left-3.5 my-auto text-stone-400"
            />
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              className="field pl-10"
              placeholder="toi@exemple.com"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">
            Mot de passe
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute inset-y-0 left-3.5 my-auto text-stone-400"
            />
            <input
              id="password"
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="field pl-10"
              placeholder="Au moins 6 caractères"
            />
          </div>
        </div>

        <button
          type="submit"
          formAction={mode === "login" ? login : signup}
          className="btn-primary w-full"
        >
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}
