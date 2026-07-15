# CDI Finder — Agent de candidature (Next.js + Supabase + Vercel)

Application web : chaque utilisateur se connecte, saisit **sa propre clé API Anthropic**
(stockée chiffrée), renseigne son profil, colle une offre → l'agent génère un **CV adapté
ATS** + une **lettre de motivation** (`.docx`), et suit ses candidatures.

## Stack

- **Next.js 15** (App Router, TypeScript) — interface + API, hébergé sur **Vercel**
- **Supabase** — base Postgres, authentification, sécurité par ligne (RLS)
- **Anthropic (Claude)** — analyse d'offre + génération (clé propre à chaque compte)
- **docx** — génération des fichiers Word compatibles ATS

---

## Mise en route (à faire une fois)

### 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**.
2. Une fois créé : **SQL Editor** → **New query** → colle le contenu de
   [`supabase/schema.sql`](./supabase/schema.sql) → **Run**. Ça crée les tables, la
   sécurité (RLS) et la création auto du profil à l'inscription.
3. **Settings → API** : note ces 3 valeurs :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - clé `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - clé `service_role` (secrète) → `SUPABASE_SERVICE_ROLE_KEY`
4. **Authentication → Providers → Email** : activé par défaut. Pour tester rapidement sans
   boîte mail, tu peux désactiver « Confirm email » (**Authentication → Sign In / Providers**).

### 2. Générer la clé de chiffrement

Elle sert à chiffrer les clés API des utilisateurs. Génère-la :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

→ c'est ta valeur `APP_ENCRYPTION_KEY` (64 caractères). **Garde-la précieusement** : si tu
la perds, les clés API déjà enregistrées deviennent illisibles.

### 3. Lancer en local

```bash
cp .env.local.example .env.local     # puis remplis les 4 valeurs
npm install
npm run dev                          # http://localhost:3000
```

Crée un compte, va dans **Paramètres** pour saisir ta clé Anthropic, remplis **Mon profil**,
puis **Nouvelle candidature**.

### 4. Déployer sur Vercel

1. Le code est déjà sur GitHub (`Fufu75/cdi_finder_promax`).
2. Va sur [vercel.com](https://vercel.com) → **Add New → Project** → importe le dépôt.
3. Dans **Environment Variables**, ajoute les **4** variables (mêmes valeurs que `.env.local`) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `APP_ENCRYPTION_KEY`
4. **Deploy**. À chaque `git push`, Vercel redéploie automatiquement.

> ⚠️ Ne mets **jamais** `.env.local` sur git (il est ignoré). Les secrets vivent dans
> Vercel (production) et `.env.local` (local) uniquement.

---

## Structure

```
app/
├── login/                  # connexion / inscription (Supabase Auth)
├── (app)/                  # espace connecté (protégé par middleware)
│   ├── dashboard/          # liste des candidatures
│   ├── nouvelle/           # créer : coller/URL → génération
│   ├── candidatures/[id]/  # détail + téléchargements + statut
│   ├── profil/             # éditer ses données (JSON)
│   └── parametres/         # clé API (chiffrée) + modèle
└── api/
    ├── generate/           # ingestion + analyse + génération + stockage
    └── candidatures/[id]/  # téléchargement CV / lettre (.docx)
lib/
├── anthropic.ts            # appels Claude (analyse, CV, lettre)
├── crypto.ts               # chiffrement AES-256-GCM des clés API
├── docx.ts                 # rendu .docx ATS
├── ingestion.ts            # URL → texte
├── supabase/               # clients (navigateur / serveur / middleware)
└── data.ts                 # lecture des données (profil, settings, candidatures)
supabase/schema.sql         # à exécuter dans Supabase
```

L'ancien code Python (`app.py`, `core/`, …) n'est plus utilisé et peut être supprimé.
