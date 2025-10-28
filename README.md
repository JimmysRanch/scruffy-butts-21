# 🐾 Scruffy Butts - Dog Grooming Management System

A comprehensive Progressive Web App (PWA) for professional dog groomers to manage appointments, customers, pets, staff, inventory, and business operations. Built with React 19, TypeScript, Vite, and powered by Supabase.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Supabase Integration](#supabase-integration)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **Appointment Scheduling** - Multi-view calendar (day/week/month/list) with conflict detection
- **Customer & Pet Management** - Complete customer profiles with pet records and grooming history
- **Point of Sale (POS)** - Integrated checkout with multiple payment methods
- **Staff Management** - Team profiles, scheduling, and performance tracking
- **Inventory Management** - Stock tracking with low-stock alerts
- **Reports & Analytics** - Comprehensive business insights and staff performance metrics
- **Dashboard** - Real-time overview of business metrics and daily schedule

### Technical Features
- 🔐 **Secure Authentication** - Email/password and magic link via Supabase Auth
- 🛡️ **Row-Level Security (RLS)** - Default-deny policies with least-privilege access
- 📱 **Progressive Web App** - Installable, offline-capable
- 🎨 **Liquid Glass UI** - Turquoise-cyan aesthetic with glass-morphic design
- 📊 **Real-time Updates** - Live data synchronization via Supabase Realtime
- 🔄 **Offline Support** - Local-first data with cloud sync

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite 6.3** - Fast build tooling
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Phosphor Icons** - Beautiful icon library

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with RLS
  - Authentication & Authorization
  - Storage for files
  - Edge Functions for server-side logic
  - Realtime subscriptions

### Development Tools
- **ESLint** - Code linting
- **GitHub Actions** - CI/CD pipelines
- **Supabase CLI** - Local development and migrations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available at [supabase.com](https://supabase.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JimmysRanch/scruffy-butts-21.git
   cd scruffy-butts-21
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://tuwkdsoiltdboiaghztz.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   
   Get these values from your Supabase project dashboard at:
   https://app.supabase.com/project/tuwkdsoiltdboiaghztz/settings/api

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at http://localhost:5173

### Database Setup

1. **Run migrations** (when connected to your Supabase project)
   
   The database schema is defined in `supabase/migrations/`. To apply migrations:
   
   ```bash
   npx supabase db push
   ```

2. **Seed development data** (optional)
   
   ```bash
   npx supabase db reset --db-url "your_database_connection_string"
   ```

See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for detailed database documentation.

## 💻 Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
```

### Local Development with Supabase

For local development with full Supabase features:

1. **Install Supabase CLI** (already included as dev dependency)
   ```bash
   npx supabase --help
   ```

2. **Start local Supabase**
   ```bash
   npx supabase start
   ```
   
   This starts local PostgreSQL, Auth, Storage, and Edge Functions.

3. **Update .env.local for local development**
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Stop local Supabase**
   ```bash
   npx supabase stop
   ```

## 🔐 Supabase Integration

### Architecture

The application uses Supabase as a complete backend solution:

```
┌─────────────────┐
│  React Web App  │
│   (TypeScript)  │
└────────┬────────┘
         │
         ├─────────────► Supabase Auth (Email/Password, Magic Link)
         │
         ├─────────────► PostgreSQL + RLS (Data Layer)
         │
         ├─────────────► Storage Buckets (Avatars, Photos, Receipts)
         │
         ├─────────────► Edge Functions (Server-side Logic)
         │
         └─────────────► Realtime (Live Updates)
```

### Security Model

- **Default-Deny RLS**: All tables have Row-Level Security enabled with explicit policies
- **Role-Based Access**: Three roles - `customer`, `staff`, `admin`
- **Client Security**: Only anonymous key exposed to clients; service role key used server-side only
- **Input Validation**: All user inputs validated with Zod schemas
- **Session Management**: Secure token refresh and storage

See [docs/SECURITY.md](docs/SECURITY.md) for complete security documentation.

### Data Models

Core entities:
- **Profiles** - User accounts (extends auth.users)
- **Customers** - Customer information
- **Pets** - Pet profiles linked to customers
- **Services** - Service catalog
- **Appointments** - Bookings with status workflow
- **Staff Members** - Team member profiles
- **Transactions** - Payment records
- **Inventory Items** - Stock management

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for complete schema documentation.

## 📁 Project Structure

```
scruffy-butts-21/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── *.tsx        # Feature components
│   ├── lib/             # Utilities and helpers
│   │   ├── supabase.ts  # Supabase client
│   │   └── database.types.ts  # Generated DB types
│   ├── hooks/           # Custom React hooks
│   ├── styles/          # Global styles
│   └── App.tsx          # Main application
├── supabase/
│   ├── migrations/      # Database migrations (SQL)
│   ├── seed/           # Seed data for development
│   └── config.toml     # Supabase configuration
├── docs/               # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── SECURITY.md
│   ├── IOS_INTEGRATION.md
│   └── API.md
├── .github/
│   └── workflows/      # CI/CD pipelines
├── .env.example        # Environment template
└── README.md          # This file
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Security & RLS Policies](docs/SECURITY.md)
- [API Documentation](docs/API.md)
- [iOS Integration Guide](docs/IOS_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

**Project:** Scruffy Butts  
**Supabase Project ID:** tuwkdsoiltdboiaghztz  
**Dashboard:** https://app.supabase.com/project/tuwkdsoiltdboiaghztz
