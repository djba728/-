# 水準測量野帳 - HI方式 (Level Survey Field Book)

## Overview

A mobile-optimized survey field book application for HI (Height of Instrument) method leveling surveys. The app is designed primarily for iPhone users and operates offline using LocalStorage for data persistence. It allows surveyors to record benchmark points, foresight readings, and automatically calculates instrument heights and elevations. Supports dark mode and CSV export with UTF-8 BOM for Japanese character compatibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React hooks with custom `useSurveyStore` hook for survey data
- **Data Persistence**: LocalStorage-based storage (no backend database required for core functionality)
  - `hi_survey_session`: Current survey session data
  - `hi_saved_benchmarks`: Saved benchmark points list
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables for light/dark mode
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Purpose**: Minimal server for static file serving and health checks
- **API**: Single health check endpoint (`/api/health`)
- **Database**: PostgreSQL with Drizzle ORM (placeholder for potential future sync features)

### Data Model (HI Method Calculations)
- **Benchmark Points (BM)**: Known elevation + backsight reading → calculates Instrument Height (HI = Known Elevation + BS)
- **Foresight Points (FS)**: Uses current HI to calculate elevation (Elevation = HI - FS)
- **Session Structure**: Contains site info, surveyor name, date, and array of survey rows

### Key Design Decisions
1. **Offline-First**: Core functionality works entirely in browser using LocalStorage
2. **Mobile-Optimized**: Portrait orientation, touch-friendly inputs, PWA manifest for iOS home screen installation
3. **Japanese Localization**: UI in Japanese, CSV export includes UTF-8 BOM for proper encoding
4. **Calculation Precision**: All elevation values stored and displayed to 3 decimal places

## External Dependencies

### UI Framework
- **Radix UI**: Complete set of accessible UI primitives (dialogs, popovers, selects, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management

### Data & State
- **@tanstack/react-query**: Server state management (minimal use in this offline app)
- **Zod**: Schema validation for survey data structures
- **Drizzle ORM**: Database toolkit (configured for PostgreSQL, used minimally)

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling
- **TypeScript**: Full type safety across client and server

### Database
- **PostgreSQL**: Available via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration management (`db:push` command)
- **connect-pg-simple**: Session store (if sessions are added later)