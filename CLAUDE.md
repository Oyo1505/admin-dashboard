# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### Plan & Review

### Before starting work

- Write a plan to .claude/tasks/TASK_NAME.md.

- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.

- Don’t over plan it, always think MVP.

- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing

- Have to respect Clean code pratice.

- Have to implant performance optimization

- All Tests have to passed green

- Have to respect RGAA, WCAG 2.2 web accessibility level minimun AA.

- You should update the plan as you work.

- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.

## Common Development Commands

### Package Management

- Use `pnpm` as the package manager (configured via packageManager field in package.json)
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server with Prisma generation and Turbopack
- `pnpm build` - Build for production (includes Prisma generation and DB push)
- `pnpm start` - Start production server

### Code Quality & Testing

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm test` - Run Jest unit tests
- `pnpm test:watch` - Run Jest in watch mode
- `pnpm e2e` - Run Playwright E2E tests
- `pnpm e2e:headed` - Run E2E tests with browser UI
- `pnpm e2e:debug` - Debug E2E tests
- `pnpm dev:test` - Start dev server for Playwright testing

### Database Operations

- `pnpm prisma generate` - Generate Prisma client
- `pnpm prisma db push` - Push schema changes to database
- `pnpm prisma studio` - Open Prisma Studio for database management

## Architecture Overview

This is a Next.js 16 movie management platform with a domain-driven architecture.

**Recent Architectural Improvements** (PR #194, #195):

- ✅ Implemented **Data Access Layer (DAL)** for centralized security following Next.js best practices
- ✅ Established **4-layer architecture**: DAL → Service → Data → Database
- ✅ Added comprehensive test coverage (26+ test files, 99.13% DAL coverage)
- ✅ Created helper functions and constants to improve code maintainability
- ✅ Service layer separation across all domains for clean business logic

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI Components**: Radix UI, Shadcn/ui, Lucide React icons
- **Backend**: Next.js API routes, Prisma ORM v6.18, PostgreSQL
- **Authentication**: Better Auth v1.3 with Google OAuth (migrated from NextAuth.js)
- **State Management**:
  - Client state: Zustand
  - Server state: TanStack Query v5 (React Query)
- **AI Integration**: Mistral AI for chatbot functionality
- **File Storage**: Google Drive API integration
- **Testing**:
  - Unit tests: Jest with Testing Library
  - E2E tests: Playwright with CI/CD integration
- **Deployment**: Vercel with analytics
- **Internationalization**: next-intl (French, English, Japanese support)

### Directory Structure

The project follows a domain-driven architecture pattern with **SOLID principles** and **Dependency Injection**:

### Domain Structure

The codebase follows domain-driven design with clear separation:

```
src/domains/
├── auth/           # Authentication logic, user management
├── movies/         # Movie CRUD, filtering, favorites
├── dashboard/      # Admin interface, analytics
├── chat-bot/       # Mistral AI integration
├── layout/         # Navigation, menus, layout components
├── ui/             # Reusable UI components
├── skeleton/       # Loading states
├── shared/         # Cross-domain utilities
└── ressources/     # Resource management
```

### Key Features

- **Multi-role system**: USER/ADMIN roles with different permissions
- **Movie management**: Full CRUD with genres, directors, subtitles
- **User favorites**: Personal movie collections
- **Analytics tracking**: User visits and behavior
- **File uploads**: Integration with Google Drive for media storage
- **Internationalization**: Support for French, English, and Japanese
- **Responsive design**: Mobile-first approach with Tailwind CSS

### Database Schema (Prisma)

Key models include:

- `User` - Authentication and user management with Better Auth
- `Session` - Better Auth session management
- `Account` - OAuth account linking
- `Movie` - Core movie entity with metadata, genres, and Google Drive integration
- `Genre` - Multilingual genre system
- `UserFavoriteMovies` - User-movie relationships
- `AnalyticsUser/AnalyticsApplication` - Usage tracking
- `AuthorizedEmail` - Email whitelist system

### Authentication & Security

- Uses Better Auth v1.3 with Google OAuth provider (migrated from NextAuth.js)
- Middleware-based route protection via `proxy.ts` (all routes except /, privacy, and legal pages require authentication)
- Role-based access control (USER/ADMIN)
- Email authorization system for controlling access
- Session-based authentication with secure cookie handling
- **Data Access Layer (DAL)** for security following [Next.js best practices](https://nextjs.org/docs/app/guides/authentication#creating-a-data-access-layer-dal)

### Development Notes

- Uses App Router with TypeScript
- Prettier configuration enforces consistent code style
- ESLint with Next.js and Prettier integration
- Testing setup:
  - Jest with jsdom environment for unit tests (26+ test files)
  - Comprehensive test coverage:
    - DAL Security Layer: 99.13% coverage
    - Data Layer: Full CRUD operations tested
    - Service Layer: Business logic unit tests
    - Hooks: TanStack Query hooks testing
  - Playwright for E2E tests (chromium, firefox, webkit)
  - GitHub Actions CI/CD integration:
    - **Jest workflow** ([.github/workflows/jest.yml](.github/workflows/jest.yml)) - Unit tests with coverage reporting
    - **Playwright workflow** ([.github/workflows/playwright.yml](.github/workflows/playwright.yml)) - E2E tests
- TanStack Query for efficient server state management
- Internationalization handled via next-intl with locale middleware
- Environment variables required for Google OAuth, database, Better Auth, and Mistral AI

### File Organization

- Pages follow Next.js App Router conventions in `src/app/`
- API Routes in `src/app/api/` for GET requests (analytics, genres, users)
- Components organized by domain in `src/domains/`
- Data layer abstraction in `src/lib/data/` (analytics, director, email, genres, movies, users)
- Shared utilities in `src/lib/` and `src/shared/`
- E2E tests in `e2e/` directory (landing-page, dashboard, home, movies, resources)
- Prisma schema defines the complete database structure
- Proxy middleware (`src/proxy.ts`) handles authentication and internationalization

### Important Patterns

- Domain-based component organization
- Server actions for data mutations (in action.ts files)
- Data layer separation in `src/lib/data/` for database queries
- API Routes for GET operations, Server Actions for mutations
- Custom hooks with TanStack Query for server state:
  - `useEmailsAutorized` - Email authorization management
  - `useAnalyticsUsersVisits` - Analytics data fetching
  - `useGoogleQueries` - Google Drive queries
  - `useMovieFilters` - Movie filtering logic
  - `useMovieData` - Movie data management
- Consistent use of TypeScript interfaces
- Shadcn/ui component library for consistent design system
- Accessibility-first approach (recent accessibility improvements)

## Project-Specific Conventions

### Domain Structure Standards

Each domain follows this pattern:

```
src/domains/[domain-name]/
├── components/          # UI components (kebab-case directories)
├── hooks/              # Custom hooks with TanStack Query (useNomDuHook pattern)
├── services/           # Business logic layer
│   ├── *.service.ts    # Service classes
│   └── __tests__/      # Service unit tests
├── actions/            # Complex server actions
├── action.ts           # Main server actions file
└── __tests__/          # Domain-specific tests (hooks, utilities)
```

### Data Access Architecture

The project implements a **4-layer security architecture**:

```
Server Actions/API Routes
    ↓
🔒 DAL Security Layer (src/lib/data/dal/)
    ↓
Service Layer (src/domains/*/services/)
    ↓
Data Layer (src/lib/data/)
    ↓
Database (Prisma)
```

#### DAL Security Layer (Data Access Layer)

**Purpose**: Centralized authentication and authorization BEFORE data access, following [Next.js best practices](https://nextjs.org/docs/app/guides/authentication#creating-a-data-access-layer-dal).

**Structure**:

```
src/lib/data/dal/
├── core/
│   ├── auth.ts          # verifySession, getCurrentUser, verifyAdmin, verifyOwnership
│   ├── errors.ts        # DALError class with HTTP status conversion
│   └── __tests__/       # 99.13% test coverage
├── helpers.ts           # withAuth, withDALAuth wrapper functions
└── index.ts            # Public exports
```

**Key Functions**:

- `verifySession()` - Ensures active session exists
- `getCurrentUser()` - Retrieves user with role (cached with React cache)
- `verifyAdmin()` - Enforces ADMIN role requirement
- `verifyOwnership(userId)` - Ensures user owns resource or is ADMIN

**Usage Pattern**:

```typescript
// Server Action (src/domains/dashboard/actions/movie.ts)
import { withAuth, verifyAdmin } from '@/lib/data/dal';

export const addMovie = withAuth(verifyAdmin, async (movie: IMovieFormData) => {
  return await MovieService.addMovie(movie);
});
```

**Benefits**:

- ✅ **Impossible to bypass**: All Actions must go through DAL
- ✅ **Security audit**: Logs unauthorized access attempts
- ✅ **Error handling**: Automatic DALError → HTTP status conversion
- ✅ **Performance**: React cache prevents duplicate DB queries
- ✅ **Type-safe**: Strongly typed with comprehensive tests

#### Service Layer (Business Logic)

**Purpose**: Contains domain-specific business logic, validation, and orchestrates data operations.

**Structure**:

```
src/domains/[domain]/services/
├── [domain].service.ts       # Main service class
├── [feature].service.ts      # Feature-specific services
└── __tests__/               # Service layer unit tests
```

**Available Services**:

- **Auth Services** ([src/domains/auth/services/](src/domains/auth/services/)):
  - `user.service.ts` - User management operations
  - `email-authorization.service.ts` - Email validation and authorization
  - `permission.service.ts` - Permission checking logic
  - `user-analytics.service.ts` - User analytics tracking

- **Movie Services** ([src/domains/movies/services/](src/domains/movies/services/)):
  - `movie.service.ts` - Movie CRUD operations
  - `movies.services.ts` - Bulk movie operations
  - `movie-detail.service.ts` - Single movie detail logic
  - `movie-favorites.service.ts` - Favorite management
  - `genre.services.ts` - Genre operations

- **Dashboard Services** ([src/domains/dashboard/services/](src/domains/dashboard/services/)):
  - `email.service.ts` - Email operations for admin
  - `director.service.ts` - Director management

- **Chat-Bot Services** ([src/domains/chat-bot/services/](src/domains/chat-bot/services/)):
  - `mistral-tools.service.ts` - Mistral AI integration

**Service Layer Benefits**:

- **Business Logic Isolation**: Separates business rules from data access
- **Validation**: Input validation before data layer calls
- **Orchestration**: Coordinates multiple data operations
- **Cache Management**: Handles `revalidatePath()` after mutations
- **Testability**: Easy to test business logic independently

#### Data Layer (Database Access)

```
src/lib/data/
├── analytics.ts        # Analytics data queries
├── director.ts         # Director data operations
├── email.ts            # Email authorization queries
├── genres.ts           # Genre data operations
├── movies.ts           # Movie data queries (includes favorites operations)
├── movies-helpers.ts   # Helper functions for movie operations
├── search.ts           # Search functionality
└── users.ts            # User data operations
```

**Data Layer Benefits**:

- **Separation of Concerns**: Database logic isolated from business logic
- **Reusability**: Methods can be used across services and API routes
- **Testability**: Easy to mock for unit testing
- **Type Safety**: Consistent return types with status codes
- **Error Handling**: Centralized error handling with `handlePrismaError()`

**Example - Complete Flow**:

```typescript
// 1. DAL Security Layer (src/lib/data/dal/core/auth.ts)
export const getCurrentUser = cache(async (): Promise<SelectUser> => {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new DALError('NOT_FOUND', 'User not found');
  return user;
});

export async function verifyAdmin() {
  const user = await getCurrentUser();
  if (user.role !== 'ADMIN') {
    console.warn(`Unauthorized admin access attempt by user ${user.id}`);
    throw new DALError('FORBIDDEN', 'Admin privileges required');
  }
  return user;
}

// 2. Server Action (src/domains/dashboard/actions/movie.ts)
import { withAuth, verifyAdmin } from '@/lib/data/dal';

export const addMovie = withAuth(
  verifyAdmin, // Security check
  async (movie: IMovieFormData) => {
    return await MovieService.addMovie(movie); // Business logic
  }
);

// 3. Service Layer (src/domains/movies/services/movie.service.ts)
export class MovieService {
  static async addMovie(movie: IMovieFormData) {
    // Validation
    if (!movie?.title?.trim()) {
      return { status: 400, message: 'Title required' };
    }

    // Data layer call
    await MovieData.create(movie);
    revalidatePath(URL_DASHBOARD_ROUTE.movie);

    return { status: 200, message: 'Success' };
  }
}

// 4. Data Layer (src/lib/data/movies.ts)
export class MovieData {
  static async create(movie: IMovieFormData) {
    try {
      const createdMovie = await prisma.movie.create({ data: movie });
      return { movie: createdMovie, status: 200 };
    } catch (error) {
      logError(error, 'MovieData.create');
      return { status: handlePrismaError(error).statusCode };
    }
  }
}
```

### Clean Code Patterns & Helper Functions

The project follows clean code principles with reusable helper functions to reduce duplication and improve maintainability.

#### Data Layer Helpers

**Location**: `src/lib/data/movies-helpers.ts`

Helper functions extract common logic from create/update operations:

```typescript
import {
  buildMovieData,
  buildGenresConnectionForCreate,
  buildGenresConnectionForUpdate,
  buildMovieInclude,
} from '@/lib/data/movies-helpers';

// Usage in MovieData.create()
static async create(movie: IMovieFormData) {
  try {
    const createdMovie = await prisma.movie.create({
      data: {
        ...buildMovieData(movie),                              // Common movie fields
        genresIds: buildGenresConnectionForCreate(movie.genresIds), // Genre relations
      },
      include: buildMovieInclude(),                            // Standard includes
    });
    return { movie: createdMovie as IMovie, status: 200 };
  } catch (error) {
    logError(error, 'MovieData.create');
    return { status: handlePrismaError(error).statusCode };
  }
}
```

**Benefits**:

- ✅ **DRY Principle**: Eliminates 80% duplication between create/update
- ✅ **Single Responsibility**: Each helper has one clear purpose
- ✅ **Reduced Complexity**: Methods reduced from 73 → 20 lines
- ✅ **Easy Testing**: Helpers can be unit tested independently
- ✅ **Consistency**: Same logic guaranteed across operations

**Available Helpers**:

- `buildMovieData(movie)` - Constructs base movie data object
- `buildGenresConnectionForCreate(genresIds)` - Creates genre relationships
- `buildGenresConnectionForUpdate(genresIds)` - Updates genre relationships (delete + create)
- `buildMovieInclude()` - Standard include object for genre data

#### Error Handling Wrapper

**Location**: `src/lib/utils/error-handler.ts`

Generic wrapper reduces try-catch boilerplate:

```typescript
import { withErrorHandling } from '@/lib/utils/error-handler';

// Instead of repetitive try-catch
static async someOperation() {
  try {
    const data = await prisma.operation();
    return { data, status: 200 };
  } catch (error) {
    logError(error, 'context');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
}

// Use wrapper for cleaner code
static async someOperation() {
  return await withErrorHandling(
    async () => await prisma.operation(),
    'MovieData.someOperation'
  );
}
```

**Benefits**:

- ✅ **Centralized Error Handling**: Consistent error management
- ✅ **Automatic Logging**: Context-aware error logging
- ✅ **Type Safety**: Generic type preserves return types
- ✅ **Reduced Boilerplate**: Eliminates repetitive try-catch blocks

#### Pagination Constants

**Location**: `src/shared/constants/pagination.ts`

Centralized constants replace magic numbers:

```typescript
import {
  MAX_LATEST_MOVIES,
  MAX_MOVIES_BY_COUNTRY,
  MAX_MOVIES_BY_GENRE,
} from '@/shared/constants/pagination';

// Before: Magic numbers scattered throughout code
const movies = await prisma.movie.findMany({ take: 5 });

// After: Named constants with clear intent
const movies = await prisma.movie.findMany({ take: MAX_LATEST_MOVIES });
```

**Available Constants**:

- `MAX_LATEST_MOVIES = 5` - Latest movies section limit
- `MAX_MOVIES_BY_COUNTRY = 3` - Movies per country limit
- `MAX_MOVIES_BY_GENRE = 5` - Movies per genre limit
- `DEFAULT_PAGE_SIZE = 20` - Default pagination size
- `MAX_PAGE_SIZE = 100` - Maximum pagination size

**Benefits**:

- ✅ **Searchability**: Easy to find all uses of a limit
- ✅ **Maintainability**: Change in one place affects all uses
- ✅ **Self-Documentation**: Names explain the purpose
- ✅ **Type Safety**: Compile-time checks for usage

#### Clean Code Checklist

When creating new data operations:

1. ✅ **Extract Common Logic**: Use helpers for shared data preparation
2. ✅ **Use Constants**: Replace magic numbers with named constants
3. ✅ **Keep Functions Short**: Target 15-20 lines per method
4. ✅ **Single Responsibility**: One function, one purpose
5. ✅ **Type Everything**: Use TypeScript types and interfaces
6. ✅ **Document Complex Logic**: JSDoc for public functions
7. ✅ **Test Independently**: Each helper function is testable
8. ✅ **Handle Errors Consistently**: Use wrapper or standard pattern

### Component Organization

- **Component naming**: kebab-case directories (e.g., `movie-header/`, `search-bar/`)
- **Component files**: PascalCase for React components
- **Domain-specific**: Keep components within their respective domains
- **Shared components**: Use `src/domains/ui/` for cross-domain components

### Server Actions Patterns

- Always start with `'use server'` directive
- Main actions in `action.ts` at domain root
- Complex actions in `actions/` subdirectory
- Use `revalidatePath()` after mutations for cache invalidation
- Import validation helpers: `import { validateId } from '@/lib/api-wrapper'`
- Error handling: `import { handlePrismaError, logError } from '@/lib/errors'`
- Prefer using data layer functions from `src/lib/data/` for database queries

### API Routes Patterns

API routes are used for GET operations and follow this structure:

```typescript
// src/app/api/[domain]/[operation]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dataLayerFunction } from '@/lib/data/[domain]';

export async function GET(request: NextRequest) {
  try {
    const data = await dataLayerFunction();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

### TanStack Query Hooks Pattern

Custom hooks leverage TanStack Query for efficient server state management:

```typescript
// src/domains/[domain]/hooks/useDataHook.ts
import { useQuery } from '@tanstack/react-query';

export const useDataHook = () => {
  return useQuery({
    queryKey: ['domain-key'],
    queryFn: async () => {
      const response = await fetch('/api/domain/operation');
      return response.json();
    },
    // Additional options: staleTime, refetchInterval, etc.
  });
};
```

### Import Conventions

```typescript
// Prisma client (prefer data layer over direct prisma access)
import prisma from '@/lib/prisma';

// Data layer functions (preferred for database access)
import { getAllMovies } from '@/lib/data/movies';
import { getUserByEmail } from '@/lib/data/users';

// Models (organized by entity)
import { IMovie, IGenre } from '@/models/movie/movie';
import { IUser } from '@/models/user/user';

// Route constants
import { URL_DASHBOARD_ROUTE, URL_MOVIE_ID } from '@/shared/route';

// Error handling
import { handlePrismaError, logError } from '@/lib/errors';

// TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

## Troubleshooting Guide

### Common Issues & Solutions

**Missing Types**

- Problem: TypeScript errors for missing interfaces
- Solution: Import from `@/models/[domain]/` directory
- Example: `import { IMovie } from '@/models/movie/movie'`

**Prisma Errors**

- Problem: Unhandled database exceptions
- Solution: Use `handlePrismaError()` wrapper
- Pattern: `catch (error) { return handlePrismaError(error); }`

**Cache Issues**

- Problem: Stale data after mutations
- Solution: Add `revalidatePath()` after database changes
- Example: `revalidatePath(URL_DASHBOARD_ROUTE)`

**Development Workflow Issues**

- Problem: Prisma client out of sync
- Solution: Run `pnpm prisma generate` after schema changes
- Problem: Database schema changes not reflected
- Solution: Run `pnpm prisma db push` to sync schema

**Testing Issues**

- Problem: E2E tests fail locally
- Solution: Run `pnpm dev:test` to start dev server with `PLAYWRIGHT_TEST_MODE=true`
- Problem: Tests pass locally but fail in CI
- Solution: Check GitHub Actions logs, ensure environment variables are set
- Problem: TanStack Query cache not invalidating
- Solution: Use `queryClient.invalidateQueries(['query-key'])` after mutations

### Testing Patterns

**Unit Tests Structure**:

```typescript
// Data Layer Tests (src/lib/data/__tests__/movies.test.ts)
import { MovieData } from '../movies';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: { create: jest.fn(), update: jest.fn(), ... },
    userFavoriteMovies: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() }
  }
}));

describe('MovieData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUniqueFavorite', () => {
    it('should find an existing favorite and return it with status 200', async () => {
      const mockFavorite = { id: 1, userId: 'user-123', movieId: 'movie-456' };
      (prisma.userFavoriteMovies.findUnique as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await MovieData.findUniqueFavorite('user-123', 'movie-456');

      expect(result).toEqual({
        favorite: { id: '1', userId: 'user-123', movieId: 'movie-456' },
        status: 200
      });
    });
  });
});
```

**Service Layer Tests**:

```typescript
// Service Tests (src/domains/movies/services/__tests__/movie-favorites.service.test.ts)
import { MovieFavoriteService } from '../movie-favorites.service';
import { MovieData } from '@/lib/data/movies';

jest.mock('@/lib/data/movies');
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

describe('MovieFavoriteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete favorite when it already exists', async () => {
    (MovieData.findUniqueFavorite as jest.Mock).mockResolvedValue({
      favorite: { id: '1', userId: 'user-123', movieId: 'movie-456' },
      status: 200,
    });

    (MovieData.deleteFavorite as jest.Mock).mockResolvedValue({
      status: 200,
      message: 'Success: movie deleted',
    });

    const result = await MovieFavoriteService.handleFavorite(
      'user-123',
      'movie-456'
    );

    expect(result).toEqual({ status: 200, message: 'Success: movie deleted' });
    expect(MovieData.deleteFavorite).toHaveBeenCalledWith(
      'user-123',
      'movie-456'
    );
  });
});
```

**Test Coverage Statistics**:

The project has comprehensive test coverage with **28 test suites** containing **458 tests**:

- **DAL Security Layer**: 3 test files, 99.13% coverage
  - [src/lib/data/dal/core/**tests**/auth.test.ts](src/lib/data/dal/core/__tests__/auth.test.ts)
  - [src/lib/data/dal/core/**tests**/errors.test.ts](src/lib/data/dal/core/__tests__/errors.test.ts)
  - [src/lib/data/dal/**tests**/helpers.test.ts](src/lib/data/dal/__tests__/helpers.test.ts)

- **Data Layer**: 7 test files covering all data operations
  - [src/lib/data/**tests**/movies.test.ts](src/lib/data/__tests__/movies.test.ts)
  - [src/lib/data/**tests**/movies-helpers.test.ts](src/lib/data/__tests__/movies-helpers.test.ts)
  - [src/lib/data/**tests**/users.test.ts](src/lib/data/__tests__/users.test.ts)
  - [src/lib/data/**tests**/genres.test.ts](src/lib/data/__tests__/genres.test.ts)
  - [src/lib/data/**tests**/director.test.ts](src/lib/data/__tests__/director.test.ts)
  - [src/lib/data/**tests**/analytics.test.ts](src/lib/data/__tests__/analytics.test.ts)
  - [src/lib/data/**tests**/email.test.ts](src/lib/data/__tests__/email.test.ts)
  - [src/lib/data/**tests**/search.test.ts](src/lib/data/__tests__/search.test.ts)

- **Service Layer**: 11 test files covering business logic
  - Auth services: 4 test files
  - Movie services: 5 test files
  - Dashboard services: 2 test files
  - Chat-Bot services: 1 test file

- **Hooks**: 3 test files for TanStack Query hooks
  - [src/domains/auth/**tests**/useEmailsAutorized.test.ts](src/domains/auth/__tests__/useEmailsAutorized.test.ts)
  - [src/domains/dashboard/**tests**/useAnalyticsUsersVisits.test.ts](src/domains/dashboard/__tests__/useAnalyticsUsersVisits.test.ts)
  - [src/domains/dashboard/**tests**/useGoogleQueries.test.ts](src/domains/dashboard/__tests__/useGoogleQueries.test.ts)

**Test Coverage Goals**:

- ✅ DAL Security Layer: 99.13% coverage achieved
- ✅ Data Layer: All CRUD operations tested with error handling
- ✅ Service Layer: Business logic and cache revalidation tested
- 🎯 Components: User interactions, rendering, accessibility (in progress)
- 🎯 E2E: Critical user flows end-to-end (Playwright tests in e2e/ directory)

**Authentication Issues**

- Problem: Better Auth session errors
- Solution: Check `src/lib/auth.ts` configuration and environment variables
- Problem: Middleware not protecting routes
- Solution: Verify `src/proxy.ts` configuration (migrated from `middleware.ts`)

## GitHub Actions CI/CD

Le projet utilise deux workflows GitHub Actions pour l'intégration continue et les tests automatisés.

### 🧪 Jest Unit Tests Workflow ([.github/workflows/jest.yml](.github/workflows/jest.yml))

**Déclenchement** :

- Push sur `main` ou `master`
- Pull requests vers `main` ou `master`

**Environnement** :

- Runner: Ubuntu Latest
- Timeout: 15 minutes
- PostgreSQL 15 en service Docker
- Node.js LTS avec cache npm/pnpm

**Étapes d'exécution** :

1. **Setup de l'environnement**
   - Checkout du code
   - Installation Node.js LTS avec cache
   - Cache pnpm store pour accélérer les builds
   - Installation pnpm et dépendances (`--frozen-lockfile`)

2. **Configuration de la base de données**

   ```bash
   pnpm prisma generate        # Génère le client Prisma
   pnpm prisma db push         # Applique le schéma
   ```

3. **Exécution des tests unitaires**

   ```bash
   pnpm test -- --coverage --maxWorkers=2
   ```

   - Exécute tous les tests Jest (26+ fichiers)
   - Génère le rapport de couverture
   - Parallélisation avec 2 workers

4. **Rapport de couverture**
   - Upload du rapport complet en artefact (30 jours)
   - Génération d'un résumé dans GitHub Actions Summary
   - Commentaire automatique sur les PR avec métriques :
     - Statements, Branches, Functions, Lines coverage
     - Détails par couche (DAL, Data, Service)

**Variables d'environnement** :

```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
BETTER_AUTH_SECRET: test-secret-key-for-ci-only-minimum-32-characters-long-safe
BETTER_AUTH_URL: http://localhost:3000
NODE_ENV: test
```

### 🎭 Playwright E2E Tests Workflow ([.github/workflows/playwright.yml](.github/workflows/playwright.yml))

**Déclenchement** :

- Push sur `main` ou `master`
- Pull requests vers `main` ou `master`

**Environnement** :

- Runner: Ubuntu Latest
- Timeout: 60 minutes
- PostgreSQL 15 en service Docker
- Chromium uniquement (optimisation CI/CD)

**Étapes d'exécution** :

1. **Setup de l'environnement**
   - Checkout du code
   - Installation Node.js LTS
   - Installation pnpm et dépendances

2. **Configuration de la base de données**

   ```bash
   pnpm prisma generate
   pnpm prisma db push --skip-generate
   ```

3. **Installation Playwright**

   ```bash
   pnpm exec playwright install --with-deps chromium
   ```

   - Installe uniquement Chromium pour optimiser le temps CI/CD
   - Inclut les dépendances système nécessaires

4. **Exécution des tests E2E**

   ```bash
   pnpm exec playwright test --project=chromium
   ```

   - Tests end-to-end dans un navigateur réel
   - Valide les flux utilisateur complets
   - Mode test activé : `PLAYWRIGHT_TEST_MODE=true`

5. **Rapport Playwright**
   - Upload du rapport HTML complet
   - Conservation 30 jours
   - Disponible même si les tests échouent (`!cancelled()`)

**Variables d'environnement** :

```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
PLAYWRIGHT_TEST_MODE: true
BETTER_AUTH_SECRET: test-secret-key-for-ci-only-minimum-32-characters-long-safe
```

### 📊 Visualisation des Tests

**Sur chaque Pull Request, vous obtiendrez** :

1. **Statut des workflows** :
   - ✅ Jest Unit Tests - 28 suites, 458 tests
   - ✅ Playwright E2E Tests

2. **Commentaire automatique avec** :
   - Métriques de couverture (statements, branches, functions, lines)
   - Détails par couche (DAL: 99.13%, Data Layer, Services)
   - Lien vers le rapport complet

3. **Artefacts téléchargeables** :
   - `jest-coverage-report/` - Rapport de couverture HTML complet
   - `playwright-report/` - Rapport Playwright avec screenshots et vidéos

### 🚀 Commandes Locales

Pour reproduire les tests CI/CD localement :

```bash
# Tests unitaires Jest (28 suites, 458 tests)
pnpm test                                      # Tous les tests
pnpm exec jest --coverage                      # Avec couverture
pnpm exec jest --coverage --maxWorkers=2       # Comme en CI/CD
pnpm test:watch                                # Mode watch

# Tests E2E Playwright
pnpm dev:test                # Lance le serveur en mode test
pnpm e2e                     # Exécute les tests E2E
pnpm e2e:headed              # Avec interface graphique
pnpm e2e:debug               # Mode debug
```

### 🔧 Optimisations CI/CD

**Performances** :

- ✅ Cache pnpm store (builds 2-3x plus rapides)
- ✅ Cache npm pour Node.js setup
- ✅ Chromium uniquement pour Playwright (vs tous les navigateurs)
- ✅ Jest avec `--maxWorkers=2` pour parallélisation optimale
- ✅ `--frozen-lockfile` pour installation reproductible

**Fiabilité** :

- ✅ PostgreSQL avec health checks
- ✅ Variables d'environnement dédiées au test
- ✅ Isolation complète de l'environnement de test
- ✅ Timeouts appropriés (15min Jest, 60min Playwright)
