# 🎬 Admin Dashboard - Plateforme de Gestion de Films

## 📋 Aperçu

Cette application est une plateforme complète de gestion de films avec authentification utilisateur, interface d'administration et système de favoris. Elle permet aux utilisateurs de parcourir, rechercher et gérer une collection de films avec une interface moderne et responsive.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités Principales
- **Authentification sécurisée** avec NextAuth.js
- **Interface d'administration** pour la gestion des films
- **Système de favoris** pour les utilisateurs
- **Support multilingue** (Français, Anglais, Japonais)
- **Interface responsive** adaptée à tous les appareils
- **Système de tags et genres** pour organiser les films
- **Intégration Google Drive** pour le stockage des médias
- **Chatbot IA** intégré avec Mistral AI

### 🎬 Gestion des Films
- Ajout/modification/suppression de films
- Gestion des métadonnées (titre, synopsis, durée, etc.)
- Support des sous-titres multiples
- Système de genres et tags
- Gestion des réalisateurs
- Contrôle de publication des films

### 👥 Gestion des Utilisateurs
- Authentification par email
- Rôles utilisateur (USER/ADMIN)
- Système de favoris personnalisé
- Profils utilisateur

## 🛠 Technologies

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React avec App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Shadcn UI](https://ui.shadcn.com/)** - Composants UI modernes
- **[React Hook Form](https://react-hook-form.com/)** - Gestion des formulaires
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gestion d'état

### Backend & Base de Données
- **[Prisma](https://www.prisma.io/)** - ORM moderne
- **[PostgreSQL](https://www.postgresql.org/)** - Base de données relationnelle
- **[NextAuth.js](https://next-auth.js.org/)** - Authentification
- **[Vercel Analytics](https://vercel.com/analytics)** - Analytics

### Intégrations
- **[Google Drive API](https://developers.google.com/drive)** - Stockage des médias
- **[Mistral AI](https://mistral.ai/)** - Chatbot IA
- **[Vercel](https://vercel.com/)** - Déploiement

### Outils de Développement
- **[ESLint](https://eslint.org/)** - Linting
- **[Prettier](https://prettier.io/)** - Formatage de code
- **[Jest](https://jestjs.io/)** - Tests unitaires
- **[pnpm](https://pnpm.io/)** - Gestionnaire de paquets

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- pnpm
- PostgreSQL
- Compte Google Cloud (pour Google Drive API)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd admin-dashboard
```

### 2. Installer les dépendances
```bash
pnpm install
```

### 3. Configuration de l'environnement
Copiez le fichier `.env.example` vers `.env` et configurez les variables :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/database"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/database"

# Authentification
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Drive API
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Mistral AI
MISTRAL_API_KEY="your-mistral-api-key"

# Email (optionnel)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### 4. Configuration de la base de données
```bash
# Générer le client Prisma
pnpm prisma generate

# Appliquer les migrations
pnpm prisma db push

# (Optionnel) Ouvrir Prisma Studio
pnpm prisma studio
```

### 5. Lancer le serveur de développement
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
admin-dashboard/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Interface d'administration
│   │   ├── movies/           # Pages des films
│   │   └── home/             # Page d'accueil
│   ├── domains/               # Architecture par domaines
│   │   ├── auth/             # Authentification
│   │   ├── movies/           # Gestion des films
│   │   ├── dashboard/        # Interface admin
│   │   ├── chat-bot/         # Chatbot IA
│   │   └── shared/           # Composants partagés
│   ├── lib/                   # Utilitaires et configuration
│   ├── messages/              # Fichiers de traduction
│   └── store/                 # Gestion d'état Zustand
├── prisma/                    # Schéma et migrations
├── public/                    # Assets statiques
└── test/                      # Tests
```

## 🎯 Utilisation

### Interface Utilisateur
1. **Page d'accueil** : Présentation de la plateforme
2. **Catalogue de films** : Parcourir et rechercher les films
3. **Système de favoris** : Ajouter/retirer des films des favoris
4. **Profil utilisateur** : Gérer ses préférences

### Interface d'Administration
1. **Dashboard** : Vue d'ensemble des statistiques
2. **Gestion des films** : CRUD complet des films
3. **Gestion des utilisateurs** : Administration des comptes
4. **Gestion des genres** : Organisation des catégories
5. **Chatbot IA** : Assistant intelligent intégré

### API Endpoints
- `/api/auth/*` - Authentification
- `/api/movies/*` - Gestion des films
- `/api/users/*` - Gestion des utilisateurs
- `/api/chat/*` - Chatbot IA

## 🔧 Scripts Disponibles

```bash
# Développement
pnpm dev          # Serveur de développement
pnpm build        # Build de production
pnpm start        # Serveur de production

# Base de données
pnpm prisma generate    # Générer le client Prisma
pnpm prisma db push     # Appliquer les migrations
pnpm prisma studio      # Interface de gestion DB

# Tests et qualité
pnpm test         # Exécuter les tests
pnpm lint         # Vérifier le code
```

## 🌐 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Variables d'environnement requises
- `DATABASE_URL` - URL de connexion PostgreSQL
- `NEXTAUTH_SECRET` - Clé secrète pour l'authentification
- `GOOGLE_CLIENT_ID` - ID client Google OAuth
- `GOOGLE_CLIENT_SECRET` - Secret client Google OAuth
- `MISTRAL_API_KEY` - Clé API Mistral AI

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.