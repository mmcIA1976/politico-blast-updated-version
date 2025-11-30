# Overview

This is a 3D arcade-style shooting game built with React, Three.js, and Express. The application features a politically-themed game where players navigate through multiple levels (cities across Spain) fighting enemies and a final boss. The game includes power-ups, mobile controls, audio effects, and a progressive difficulty system across 7 levels.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**3D Rendering**: The application uses React Three Fiber (@react-three/fiber) as a React renderer for Three.js, along with @react-three/drei for common 3D utilities and @react-three/postprocessing for visual effects. This approach allows declarative 3D scene composition using React components.

**State Management**: Zustand is used for global state management through custom stores:
- `useArcadeGame` - Manages game state (player position, enemies, bullets, score, lives, level progression)
- `useAudio` - Handles audio state (background music, sound effects, mute toggle)

The choice of Zustand over Redux or Context API provides a simpler, more performant solution with less boilerplate for this game's state needs.

**UI Components**: The application uses Radix UI primitives with custom styling through Tailwind CSS and class-variance-authority. This provides accessible, headless components that can be styled consistently.

**Styling**: Tailwind CSS with PostCSS for utility-first styling. Custom CSS variables are used for theming (colors, border radius) defined in the Tailwind config.

**Build Strategy**: 
- Development: Vite dev server with HMR
- Production: Vite builds the frontend to `dist/public`, esbuild bundles the server to `dist/index.js`

## Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript, using ESM modules.

**Middleware Pattern**: The server uses a custom middleware for request logging that captures JSON responses and logs API calls with duration metrics.

**Route Organization**: Routes are registered through a `registerRoutes` function that returns an HTTP server instance. API routes are prefixed with `/api`.

**Storage Layer**: The application uses an interface-based storage pattern (`IStorage`) with a current in-memory implementation (`MemStorage`). This abstraction allows easy switching to database-backed storage without changing application code.

**Development/Production Separation**: Vite middleware is only attached in development mode. In production, the server serves static files from the built frontend.

## Data Storage

**Database**: PostgreSQL (via Neon serverless driver @neondatabase/serverless) with Drizzle ORM for type-safe database operations.

**Schema Management**: Database schema is defined in `shared/schema.ts` using Drizzle's declarative API. Migrations are stored in the `./migrations` directory.

**Schema Validation**: Drizzle-Zod integration provides runtime validation of data against the database schema, ensuring type safety from database to frontend.

**Current Schema**: Basic user table with username/password fields. The schema uses serial IDs and enforces unique usernames.

**Storage Interface**: The codebase abstracts database operations through an `IStorage` interface, currently implemented with in-memory storage. This will need to be replaced with a Drizzle-based implementation to persist data.

## External Dependencies

**3D Graphics & Game Engine**:
- `three` - Core 3D library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Helper components and hooks for R3F
- `@react-three/postprocessing` - Post-processing effects
- `vite-plugin-glsl` - GLSL shader support

**Database & ORM**:
- `@neondatabase/serverless` - PostgreSQL database connection
- `drizzle-orm` - TypeScript ORM for type-safe database queries
- `drizzle-kit` - Database migration tool
- `drizzle-zod` - Zod schema generation from Drizzle schemas

**UI Framework**:
- `@radix-ui/*` - Headless, accessible UI primitives (accordion, dialog, dropdown, etc.)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `cmdk` - Command menu component

**State & Data Fetching**:
- `@tanstack/react-query` - Server state management and caching
- `zustand` (implied by store patterns) - Client state management

**Utilities**:
- `date-fns` - Date manipulation
- `nanoid` - Unique ID generation
- `zod` - Runtime type validation

**Development Tools**:
- `tsx` - TypeScript execution for development server
- `esbuild` - Fast JavaScript bundler for production build
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay

**Asset Support**: The Vite configuration includes support for 3D models (`.gltf`, `.glb`) and audio files (`.mp3`, `.ogg`, `.wav`).