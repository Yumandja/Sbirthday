# 👑 Sadia Birthday — Setup Guide

## Structure du projet
```
sadia-birthday/
├── src/
│   ├── components/
│   │   ├── MatrixRain.jsx      ← Pluie matrix rose animée
│   │   ├── IntroSequence.jsx   ← HAPPY → 24 → BIRTHDAY → PRINCESS
│   │   ├── HeartGallery.jsx    ← Photos disposées en cœur ❤️
│   │   └── AdminUpload.jsx     ← Panneau upload photos/vidéos
│   ├── lib/
│   │   └── supabase.js         ← Config Supabase
│   └── App.jsx                 ← Page principale
├── .env.example                ← Variables à configurer
└── vercel.json                 ← Config déploiement
```

---

## ✅ ÉTAPE 1 — Configurer Supabase (5 min)

1. Va sur **https://supabase.com** → crée un compte gratuit
2. Crée un **New Project** (ex: "sadia-birthday")
3. Dans ton projet → **Storage** → **New Bucket**
   - Nom : `gallery`                              //#EvbY!t5MFp#w4D
   - ✅ Public bucket → Save
4. Dans **Storage → Policies**, ajoute cette règle pour autoriser les uploads :
   - Policy name : `allow all`
   - Allowed operations : `SELECT`, `INSERT`, `DELETE`
   - Target roles : `anon`
5. Va dans **Settings → API** et copie :
   - `Project URL` → c'est ton `VITE_SUPABASE_URL`
   - `anon public key` → c'est ton `VITE_SUPABASE_ANON_KEY`

---

## ✅ ÉTAPE 2 — Configurer le projet en local

```bash
# 1. Entre dans le dossier
cd sadia-birthday

# 2. Installe les dépendances
npm install

# 3. Copie le fichier .env
cp .env.example .env.local

# 4. Ouvre .env.local et remplis tes valeurs Supabase :
# VITE_SUPABASE_URL=https://XXXXXX.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_ADMIN_PASSWORD=ton-mot-de-passe-admin

# 5. Lance en local
npm run dev
```

Ouvre http://localhost:5173 → le site tourne ! 🎉

---

## ✅ ÉTAPE 3 — Uploader les photos

1. Sur le site, clique le bouton **⚙️** en bas à droite
2. Entre ton mot de passe admin
3. Glisse/dépose tes photos ET vidéos
4. Elles apparaissent automatiquement dans la galerie en forme de cœur ❤️

---

## ✅ ÉTAPE 4 — Déployer sur Vercel (2 min)

```bash
# Option A : Via CLI
npm install -g vercel
vercel

# Option B : Via GitHub (recommandé)
# 1. Push ton code sur GitHub
# 2. Va sur vercel.com → Import Project → sélectionne le repo
# 3. Dans "Environment Variables", ajoute tes 3 variables .env
# 4. Deploy !
```

Ton site sera en ligne sur une URL comme `sadia-birthday.vercel.app` 🚀

---

## 🎨 Personnalisation rapide

| Quoi modifier | Où |
|---|---|
| Mots de l'intro (HAPPY, BIRTHDAY...) | `src/components/IntroSequence.jsx` → tableau `STEPS` |
| Le message d'anniversaire | `src/App.jsx` → section `Message card` |
| La date affichée | `src/App.jsx` → `✦ 24 Avril ✦` |
| Le mot de passe admin | `.env.local` → `VITE_ADMIN_PASSWORD` |
| Nombre de photos dans le cœur | `src/components/HeartGallery.jsx` → `Math.min(media.length, 20)` |

---

## ❓ Problèmes fréquents

**"Error: supabaseUrl is required"** → Vérifie que `.env.local` existe et a les bonnes valeurs

**Photos non affichées** → Vérifie que le bucket est bien en **Public** dans Supabase

**Upload échoue** → Vérifie les Storage Policies (étape 1, point 4)
