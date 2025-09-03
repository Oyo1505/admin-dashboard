# Guide de Gestion des Erreurs API

Ce projet utilise un système centralisé de gestion des erreurs pour une meilleure expérience développeur et utilisateur.

## Architecture

### 1. Types d'Erreurs (`src/lib/errors.ts`)

- **AppError**: Classe principale pour les erreurs applicatives
- **ErrorCode**: Énumération des codes d'erreur standardisés
- **Utilitaires**: Fonctions pour créer et gérer les erreurs

### 2. Wrapper API (`src/lib/api-wrapper.ts`)

- **withErrorHandling**: Wrapper pour les fonctions serveur
- **ApiResponse**: Interface standardisée pour les réponses
- **Validation**: Fonctions de validation des données

### 3. Gestion Côté Client (`src/lib/client-errors.ts`)

- **handleClientError**: Gestion des erreurs côté client
- **safeApiCall**: Appels API sécurisés
- **ClientErrorHandler**: Gestionnaire global d'erreurs

### 4. Hooks React (`src/hooks/use-error-handler.ts`)

- **useErrorHandler**: Hook de base pour la gestion d'erreurs
- **useApiCall**: Hook pour les appels API
- **useAsyncOperation**: Hook pour les opérations asynchrones

## Utilisation

### Server Actions

```typescript
// Avant (ancien système)
export const getMovie = async (id: string) => {
  try {
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return { status: 404, message: 'Film non trouvé' };
    }
    return { status: 200, movie };
  } catch (error) {
    console.log(error);
    return { status: 500, message: 'Erreur serveur' };
  }
};

// Après (nouveau système)
const _getMovie = async (id: string) => {
  validateId(id);
  
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    throw createError.notFound('Film', id);
  }
  
  return movie;
};

export const getMovie = withErrorHandling(_getMovie, 'getMovie');
```

### Composants React

```typescript
// Utilisation basique avec toast
function MovieComponent({ movieId }: { movieId: string }) {
  const errorHandler = useErrorHandler({ showToast: true });

  const loadMovie = async () => {
    const movie = await errorHandler.executeWithErrorHandling(async () => {
      const response = await getMovie(movieId);
      return errorHandler.handleApiResponse(response);
    });

    if (movie) {
      // Succès - utiliser les données
      console.log('Film chargé:', movie);
    }
  };

  return (
    <div>
      {errorHandler.isError && (
        <Alert variant="destructive">
          {errorHandler.error}
        </Alert>
      )}
      <Button onClick={loadMovie}>Charger le film</Button>
    </div>
  );
}

// Utilisation avec hook spécialisé
function FavoriteButton({ movieId, userId }: { movieId: string; userId: string }) {
  const favoriteApi = useApiCall(addOrRemoveToFavorite, {
    showToast: true,
    onError: (error) => {
      // Gestion personnalisée de l'erreur
      console.log('Erreur favoris:', error);
    }
  });

  return (
    <Button 
      onClick={() => favoriteApi.execute(userId, movieId)}
      disabled={favoriteApi.isLoading}
    >
      {favoriteApi.isLoading ? 'Chargement...' : 'Toggle Favorite'}
    </Button>
  );
}
```

## Codes d'Erreur Standards

### Erreurs Génériques
- `INTERNAL_SERVER_ERROR`: Erreur serveur interne
- `VALIDATION_ERROR`: Données invalides
- `NOT_FOUND`: Ressource introuvable
- `UNAUTHORIZED`: Non authentifié
- `FORBIDDEN`: Accès interdit
- `BAD_REQUEST`: Requête malformée

### Erreurs Base de Données
- `DATABASE_CONNECTION_ERROR`: Connexion DB échouée
- `DATABASE_QUERY_ERROR`: Erreur de requête
- `DUPLICATE_ENTRY`: Entrée dupliquée

### Erreurs Métier
- `MOVIE_NOT_FOUND`: Film introuvable
- `GENRE_NOT_FOUND`: Genre introuvable
- `USER_NOT_FOUND`: Utilisateur introuvable

### Erreurs API Externes
- `GOOGLE_DRIVE_ERROR`: Erreur Google Drive
- `MISTRAL_API_ERROR`: Erreur API Mistral

## Bonnes Pratiques

### 1. Validation des Données
```typescript
// Toujours valider les entrées
const _updateMovie = async (id: string, data: MovieData) => {
  validateId(id);
  validateString(data.title, 'title', { minLength: 1, maxLength: 200 });
  validateString(data.director, 'director', { minLength: 1, maxLength: 100 });
  
  // Logique métier...
};
```

### 2. Gestion des Erreurs Prisma
```typescript
// Le système gère automatiquement les erreurs Prisma
try {
  await prisma.movie.create({ data: movieData });
} catch (error) {
  // handlePrismaError convertit automatiquement les erreurs Prisma
  throw handlePrismaError(error, 'createMovie');
}
```

### 3. Messages d'Erreur Localisés
```typescript
// Les messages sont automatiquement localisés en français
throw createError.notFound('Film', id); // "Film avec l'ID xyz introuvable"
throw createError.validation('Le titre est requis'); // Message personnalisé
```

### 4. Logging Structuré
```typescript
// Le logging est automatique et structuré
logError(error, 'MovieService.getMovie');
// Output: [2024-01-01T12:00:00Z] [MovieService.getMovie] AppError [NOT_FOUND]: ...
```

## Migration depuis l'Ancien Système

### Étape 1: Mettre à jour les Server Actions
1. Extraire la logique métier dans une fonction privée `_functionName`
2. Ajouter les validations nécessaires
3. Remplacer les `return { status: 500 }` par `throw createError.internal()`
4. Wrapper la fonction avec `withErrorHandling`

### Étape 2: Mettre à jour les Composants
1. Remplacer la gestion manuelle des erreurs par `useErrorHandler`
2. Utiliser `handleApiResponse` pour traiter les réponses
3. Ajouter des toasts pour les erreurs si nécessaire

### Étape 3: Tests
1. Tester les cas d'erreur avec les nouveaux codes
2. Vérifier que les messages sont appropriés
3. S'assurer que les toasts s'affichent correctement

## Dépendances Requises

Assurez-vous d'avoir installé:
- `sonner` pour les toasts (déjà présent dans le projet)
- `react-error-boundary` pour les error boundaries (optionnel)

```bash
pnpm add sonner react-error-boundary
```

## Configuration

### Toast Configuration
Les toasts utilisent Sonner. Assurez-vous d'avoir le `<Toaster />` dans votre layout :

```typescript
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

## Avantages

1. **Consistance**: Messages d'erreur standardisés
2. **Développeur**: Meilleure expérience de développement
3. **Utilisateur**: Messages d'erreur clairs et localisés
4. **Debugging**: Logging structuré et détaillé
5. **Maintien**: Code plus facile à maintenir
6. **Type Safety**: TypeScript pour éviter les erreurs