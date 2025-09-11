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
- `pnpm test` - Run Jest tests

### Database Operations

- `pnpm prisma generate` - Generate Prisma client
- `pnpm prisma db push` - Push schema changes to database
- `pnpm prisma studio` - Open Prisma Studio for database management

## Architecture Overview

This is a Next.js 15 movie management platform with a domain-driven architecture:

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui, Lucide React icons
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js v5 with Google OAuth
- **State Management**: Zustand (though no store files are currently present)
- **AI Integration**: Mistral AI for chatbot functionality
- **File Storage**: Google Drive API integration
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

- `User` - Authentication and user management with NextAuth
- `Movie` - Core movie entity with metadata, genres, and Google Drive integration
- `Genre` - Multilingual genre system
- `UserFavoriteMovies` - User-movie relationships
- `AnalyticsUser/AnalyticsApplication` - Usage tracking
- `AuthorizedEmail` - Email whitelist system

### Authentication & Security

- Uses NextAuth.js v5 with Google OAuth provider
- Middleware-based route protection (all routes except /, privacy, and legal pages require authentication)
- Role-based access control (USER/ADMIN)
- Email authorization system for controlling access

### Development Notes

- Uses App Router with TypeScript
- Prettier configuration enforces consistent code style
- ESLint with Next.js and Prettier integration
- Jest configured for testing with jsdom environment
- Internationalization handled via next-intl with locale middleware
- Environment variables required for Google OAuth, database, and Mistral AI

### File Organization

- Pages follow Next.js App Router conventions in `src/app/`
- Components organized by domain in `src/domains/`
- Shared utilities in `src/lib/` and `src/shared/`
- Prisma schema defines the complete database structure
- Middleware handles authentication and internationalization

### Important Patterns

- Domain-based component organization
- Server actions for data mutations (in action.ts files)
- Custom hooks for data fetching and state management
- Consistent use of TypeScript interfaces
- Shadcn/ui component library for consistent design system

## Project-Specific Conventions

### Domain Structure Standards

Each domain follows this pattern:

```
src/domains/[domain-name]/
├── components/          # UI components (kebab-case directories)
├── hooks/              # Custom hooks (useNomDuHook pattern)
├── actions/            # Complex server actions
└── action.ts           # Main server actions file
```

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

### Import Conventions

```typescript
// Prisma client
import prisma from '@/lib/prisma';

// Models (organized by entity)
import { IMovie, IGenre } from '@/models/movie/movie';
import { IUser } from '@/models/user/user';

// Route constants
import { URL_DASHBOARD_ROUTE, URL_MOVIE_ID } from '@/shared/route';

// Error handling
import { handlePrismaError, logError } from '@/lib/errors';
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
