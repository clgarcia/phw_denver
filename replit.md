# EventHub - Event Coordination & Admin Platform

## Overview

EventHub is a full-stack event coordination and administration platform that allows organizations to manage events, programs, and registrations. The application provides a public-facing interface for users to browse events and programs, register for them, and an admin dashboard for managing all aspects of the platform.

The platform supports:
- Event creation and management with capacity tracking
- Program management with scheduling and pricing
- Registration system for both events and programs
- Admin dashboard for oversight and management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight routing library)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin

The frontend follows a page-based structure where each route maps to a component in `client/src/pages/`. Shared layout components (Header, Footer) are in `client/src/components/layout/`. The UI component library is in `client/src/components/ui/`.

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Design**: RESTful JSON API endpoints prefixed with `/api`
- **Server Entry**: `server/index.ts` bootstraps Express and HTTP server

Routes are registered in `server/routes.ts` with CRUD operations for events, programs, and registrations. The storage layer in `server/storage.ts` uses an interface pattern (`IStorage`) with a PostgreSQL-backed implementation (`DatabaseStorage`) for persistent data storage.

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Migrations**: Managed via `drizzle-kit push` command

Database tables:
- `users` - Admin user accounts
- `events` - Event definitions with capacity tracking
- `programs` - Program definitions with scheduling and pricing
- `registrations` - User registrations linked to events or programs

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Vite builds to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Type Checking**: TypeScript with strict mode, path aliases for `@/` and `@shared/`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for Express sessions

### UI Framework
- **Radix UI**: Complete set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Form Handling
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Zod integration for validation

### Development Tools
- **Vite**: Development server and build tool
- **Drizzle Kit**: Database migration tooling
- **tsx**: TypeScript execution for Node.js

### Email Service
- **Mailgun**: Transactional email service for registration confirmations
- **Configuration**: Requires `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` environment variables
- **Email Module**: `server/email.ts` handles sending registration confirmation emails
- **Note**: For sandbox domains, recipient emails must be authorized in Mailgun dashboard