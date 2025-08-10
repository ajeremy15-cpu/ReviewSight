# ReviewScope - Business Review Analytics Platform

## Overview

ReviewScope is a comprehensive full-stack SaaS platform that aggregates customer reviews from multiple sources (Google, TripAdvisor, Yelp, CSV uploads), analyzes them with AI, and provides actionable business intelligence. The platform features AI-powered sentiment analysis across 6 key aspects, interactive dashboards, a creator marketplace for brand partnerships, training libraries, and automated weekly reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state and data fetching
- **UI Framework**: Tailwind CSS with shadcn/ui component library (New York style)
- **Charts**: Chart.js for data visualizations
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the entire stack
- **API Design**: RESTful API with organized route handlers
- **File Handling**: Multer for multipart form data and CSV uploads
- **CSV Processing**: PapaParse for parsing uploaded review data
- **Report Generation**: PDFKit for generating downloadable weekly reports
- **Session Management**: Built-in session handling for authentication

### Database & ORM
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Design**: Comprehensive relational model supporting:
  - User management with role-based access (OWNER/CREATOR)
  - Organization multi-tenancy
  - Review aggregation from multiple sources
  - AI-powered aspect scoring and sentiment analysis
  - Creator profiles with stats and brand-fit scoring
  - Training resources and usage tracking

### Authentication & Authorization
- **Authentication**: Custom bcrypt-based credential system
- **Session Management**: Server-side session storage
- **Role-Based Access**: Separate interfaces for business owners and content creators
- **Middleware**: Custom auth middleware for protected routes

### AI Integration
- **AI Service**: OpenAI API integration for sentiment analysis and insights
- **Aspect Analysis**: Automated scoring across 6 business aspects (cleanliness, staff, food quality, value, location, speed)
- **Insight Generation**: AI-powered summary generation and recommendations
- **Usage Tracking**: Comprehensive logging of AI API calls and token usage

### File Processing
- **Upload Handling**: Multer middleware for CSV file uploads
- **Data Processing**: Automated parsing and validation of review data
- **Bulk Operations**: Efficient batch processing for large review datasets

### Deployment Architecture
- **Platform**: Optimized for Replit deployment
- **Environment**: Separate development and production configurations
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Asset Management**: Organized asset structure with path aliasing

## External Dependencies

### Core Services
- **Database**: Neon PostgreSQL serverless database
- **AI Processing**: OpenAI API for natural language processing and sentiment analysis
- **File Storage**: Server-side file handling for CSV uploads

### Development Tools
- **Build System**: Vite with React plugin and runtime error overlay
- **Database Management**: Drizzle Kit for schema migrations and database operations
- **Type Safety**: TypeScript with strict configuration across frontend and backend

### UI/UX Libraries
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Icons**: Lucide React icon library
- **Charts**: Chart.js with React integration for data visualization
- **Forms**: React Hook Form with Hookform resolvers for validation

### Utility Libraries
- **Validation**: Zod for runtime type checking and schema validation
- **Styling**: Tailwind CSS with class variance authority for component variants
- **Date Handling**: Built-in JavaScript date handling
- **Cryptography**: bcrypt for password hashing
- **UUID Generation**: Database-level UUID generation for primary keys