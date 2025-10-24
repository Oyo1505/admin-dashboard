# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### Plan & Review

### Before starting work

- Write a plan to .claude/tasks/TASK_NAME.md.

- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.

- Don’t over plan it, always think MVP.

- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing

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

This is a Next.js 16 movie management platform with a domain-driven architecture:

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

### Development Notes

- Uses App Router with TypeScript
- Prettier configuration enforces consistent code style
- ESLint with Next.js and Prettier integration
- Testing setup:
  - Jest with jsdom environment for unit tests
  - Playwright for E2E tests (chromium, firefox, webkit)
  - GitHub Actions CI/CD integration for automated testing
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
├── actions/            # Complex server actions
├── action.ts           # Main server actions file
└── __tests__/          # Domain-specific tests
```

### Data Layer Architecture

The project uses a layered architecture for data access:

```
src/lib/data/           # Data access layer (database queries)
├── analytics.ts        # Analytics data queries
├── director.ts         # Director data operations
├── email.ts            # Email authorization queries
├── genres.ts           # Genre data operations
├── movies.ts           # Movie data queries
└── users.ts            # User data operations
```

This layer is used by both API routes and Server Actions to maintain separation of concerns.

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

**Authentication Issues**

- Problem: Better Auth session errors
- Solution: Check `src/lib/auth.ts` configuration and environment variables
- Problem: Middleware not protecting routes
- Solution: Verify `src/proxy.ts` configuration (migrated from `middleware.ts`)
