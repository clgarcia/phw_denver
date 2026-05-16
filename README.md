# React-PHW: Event & Trip Registration Platform

A full-stack web application for managing and registering participants for events, programs, and trips. Built with modern React, TypeScript, and Node.js, this platform provides an intuitive interface for both administrators and participants.

## Overview

React-PHW is an event coordination platform designed to streamline the registration process for outdoor activities, volunteer opportunities, and community programs. The application features:

- **Event Management**: Create and manage events with flexible scheduling (single dates or date ranges)
- **Program Management**: Organize multi-day programs with schedules and capacity tracking
- **Trip Management**: Coordinate trips with volunteer capacity tracking
- **Registration System**: Collect participant information with validation and status tracking
- **Admin Dashboard**: Manage all registrations, view analytics, and export data
- **Responsive Design**: Mobile-friendly interface with nature-inspired design

## Architecture

### Tech Stack

**Frontend:**
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui + Radix UI** - Accessible component libraries
- **React Query (@tanstack/react-query)** - Server state management
- **React Hook Form** - Efficient form handling with validation
- **Wouter** - Lightweight routing
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **date-fns** - Date manipulation

**Backend:**
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe backend code
- **Drizzle ORM** - Lightweight SQL ORM
- **PostgreSQL** - Production database
- **Passport.js** - Authentication middleware
- **Express Session** - Session management
- **Mailgun.js** - Email service integration
- **Google APIs** - Google Forms integration

**DevOps & Database:**
- **Drizzle Kit** - Database migration tool
- **TSX** - TypeScript execution runtime
- **Express FileUpload** - File upload handling

## Database Schema

The application uses PostgreSQL with the following core tables:

- **users** - Admin authentication
- **events** - Event records with capacity and registration tracking
- **programs** - Multi-day program records
- **trips** - Trip records with volunteer capacity
- **registrations** - Participant registration records across events/programs/trips
- **settings** - Configuration key-value pairs

### Features:
- Flexible scheduling (single date or date range support)
- Capacity management with registered count tracking
- Google Forms URL integration for external registration
- Active/inactive status management
- Registration status tracking (pending, confirmed, etc.)
- Additional dates support for complex schedules

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd React-PHW

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and API keys
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/phw
NODE_ENV=development


### Development

```bash
# Start development server (runs both client and server)
npm run dev

# Type checking
npm run check

# Database migrations
npm run db:push
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
react-phw/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components (events, programs, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and contexts
│   │   └── App.tsx        # Main App component
│   └── public/            # Static assets
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
├── shared/                # Shared code between client and server
│   └── schema.ts         # Data schemas (Zod + Drizzle)
├── migrations/            # Database migration files
├── netlify/               # Netlify Functions (serverless)
├── public/                # Public assets (JSON data, uploads)
└── types/                 # TypeScript type definitions
```

## Design System

**Design Approach**: Nature-inspired, warm and welcoming design focused on community and outdoor activities

**Color Palette**:
- **Primary**: Olive Green (#4A5D23)
- **Accent**: Warm brown earth tones
- **Success**: Green (confirmations)
- **Warning**: Amber (pending items)
- **Neutral**: Clean whites and grays

**Typography**: Inter font family with responsive sizing

**Components**: Built with shadcn/ui providing consistent, accessible UI components

## Authentication

- Admin authentication via Passport.js with local strategy
- Session-based authentication with PostgreSQL session store
- Protected admin routes

## API Endpoints

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin)
- `PATCH /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Programs
- `GET /api/programs` - List all programs
- `GET /api/programs/:id` - Get program details
- `POST /api/programs` - Create program (admin)
- `PATCH /api/programs/:id` - Update program (admin)
- `DELETE /api/programs/:id` - Delete program (admin)

### Trips
- `GET /api/trips` - List all trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create trip (admin)
- `PATCH /api/trips/:id` - Update trip (admin)
- `DELETE /api/trips/:id` - Delete trip (admin)

### Registrations
- `GET /api/registrations` - List all registrations
- `POST /api/registrations` - Create registration
- `PATCH /api/registrations/:id` - Update registration (admin)
- `DELETE /api/registrations/:id` - Delete registration (admin)

## Deployment

The application supports multiple deployment platforms:

- **Netlify** - See `netlify.toml` for configuration
- **Render** - See `render.yaml` for deployment config

## Key Features

-  Responsive mobile-first design
-  Type-safe full-stack TypeScript
-  Database migrations and schema versioning
-  Form validation with Zod and React Hook Form
-  Real-time data synchronization with React Query
-  Email integration via Mailgun
-  Google Forms integration
-  File upload support
-  Admin dashboard with analytics
-  Participant registration tracking

---

**Last Updated**: May 2026
