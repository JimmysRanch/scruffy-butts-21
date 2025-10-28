# Architecture Overview

## System Architecture

Scruffy Butts is built as a modern Progressive Web App (PWA) with a cloud-native backend powered by Supabase.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐         ┌───────────────────────┐  │
│  │   React Web App    │         │   Native iOS App      │  │
│  │  (React 19 + TS)   │         │  (Swift + SwiftUI)    │  │
│  │                    │         │                       │  │
│  │  - Tailwind CSS    │         │  - supabase-swift     │  │
│  │  - Radix UI        │         │  - SwiftUI           │  │
│  │  - React Query     │         │  - Keychain Storage   │  │
│  └─────────┬──────────┘         └──────────┬────────────┘  │
│            │                               │                │
│            └───────────────┬───────────────┘                │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             │ HTTPS + WebSockets
                             │
┌────────────────────────────┼────────────────────────────────┐
│                    Supabase Backend                          │
├────────────────────────────┴────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Auth       │  │   Realtime   │  │  Edge Functions │  │
│  │              │  │              │  │   (Deno)        │  │
│  │ - Email/Pass │  │ - WebSocket  │  │                 │  │
│  │ - Magic Link │  │ - Postgres   │  │ - Webhooks      │  │
│  │ - PKCE/OAuth │  │   CDC        │  │ - Admin Ops     │  │
│  └──────┬───────┘  └──────┬───────┘  │ - Notifications │  │
│         │                 │          └────────┬────────┘  │
│         │    ┌────────────┴─────────────┐     │          │
│         │    │                          │     │          │
│  ┌──────┴────┴──────┐         ┌─────────┴─────┴────┐    │
│  │   PostgreSQL     │         │     Storage        │    │
│  │                  │         │                    │    │
│  │  - Row-Level     │         │  - Avatars         │    │
│  │    Security      │         │  - Pet Photos      │    │
│  │  - Migrations    │         │  - Receipts        │    │
│  │  - Extensions    │         │  - RLS Policies    │    │
│  └──────────────────┘         └────────────────────┘    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend (Web)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.3
- **Styling**: Tailwind CSS 4 with custom liquid glass theme
- **UI Components**: Radix UI primitives
- **State Management**: React hooks + TanStack Query (React Query)
- **Icons**: Phosphor Icons (duotone weight)
- **Forms**: React Hook Form + Zod validation

### Frontend (iOS)
- **Language**: Swift
- **UI Framework**: SwiftUI
- **Backend Client**: supabase-swift
- **Secure Storage**: Keychain
- **HTTP**: URLSession with async/await

### Backend (Supabase)
- **Database**: PostgreSQL 17
- **Authentication**: Supabase Auth (GoTrue)
- **Storage**: S3-compatible object storage
- **Functions**: Deno Edge Functions
- **Realtime**: WebSocket with PostgreSQL CDC

## Data Flow

### Authentication Flow

```
┌─────────┐                  ┌──────────┐                ┌──────────────┐
│ Client  │                  │  Supabase│                │  PostgreSQL  │
│         │                  │   Auth   │                │              │
└────┬────┘                  └────┬─────┘                └──────┬───────┘
     │                            │                             │
     │ 1. Sign In Request         │                             │
     ├───────────────────────────>│                             │
     │    (email + password)      │                             │
     │                            │                             │
     │                            │ 2. Verify Credentials       │
     │                            ├────────────────────────────>│
     │                            │                             │
     │                            │ 3. User Record              │
     │                            │<────────────────────────────┤
     │                            │                             │
     │ 4. JWT Token + Session     │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │ 5. Fetch Profile           │                             │
     ├───────────────────────────────────────────────────────> │
     │    (with JWT in header)    │                             │
     │                            │                             │
     │ 6. Profile Data            │                             │
     │<─────────────────────────────────────────────────────── │
     │    (RLS enforced)          │                             │
     │                            │                             │
```

### Data Access Flow (with RLS)

```
┌─────────┐         ┌──────────────┐         ┌──────────────┐
│ Client  │         │  PostgREST   │         │  PostgreSQL  │
│         │         │   API        │         │   + RLS      │
└────┬────┘         └──────┬───────┘         └──────┬───────┘
     │                     │                        │
     │ 1. Query Request    │                        │
     ├────────────────────>│                        │
     │  + JWT Token        │                        │
     │                     │                        │
     │                     │ 2. Execute Query       │
     │                     │    with auth context   │
     │                     ├───────────────────────>│
     │                     │                        │
     │                     │ 3. RLS Policy Check    │
     │                     │    (role, user_id)     │
     │                     │                        │
     │                     │ 4. Filtered Results    │
     │                     │<───────────────────────┤
     │                     │                        │
     │ 5. JSON Response    │                        │
     │<────────────────────┤                        │
     │                     │                        │
```

### Realtime Subscription Flow

```
┌─────────┐         ┌──────────────┐         ┌──────────────┐
│ Client  │         │  Realtime    │         │  PostgreSQL  │
│         │         │  Server      │         │     CDC      │
└────┬────┘         └──────┬───────┘         └──────┬───────┘
     │                     │                        │
     │ 1. Subscribe        │                        │
     ├────────────────────>│                        │
     │  (appointments)     │                        │
     │                     │ 2. Listen for Changes  │
     │                     ├───────────────────────>│
     │                     │                        │
     │                     │                        │
     │                     │ 3. INSERT/UPDATE event │
     │                     │<───────────────────────┤
     │                     │                        │
     │                     │ 4. Apply RLS Filter    │
     │                     │    (user can see?)     │
     │                     │                        │
     │ 5. Push Update      │                        │
     │<────────────────────┤                        │
     │  (if allowed)       │                        │
     │                     │                        │
```

## Security Architecture

### Defense in Depth

1. **Network Layer**
   - HTTPS/TLS for all communications
   - CORS policies configured
   - Rate limiting on API endpoints

2. **Authentication Layer**
   - JWT-based authentication
   - Secure session management
   - Token refresh rotation
   - PKCE flow for mobile

3. **Authorization Layer**
   - Row-Level Security (RLS) on all tables
   - Role-based access control (RBAC)
   - Default-deny policies
   - Least-privilege principle

4. **Application Layer**
   - Input validation (Zod schemas)
   - XSS prevention
   - CSRF protection
   - Sanitized outputs

5. **Data Layer**
   - Encrypted at rest
   - Encrypted in transit
   - Audit logging
   - Soft deletes where appropriate

### Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                          Roles                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Customer   │  │    Staff     │  │     Admin       │  │
│  │              │  │              │  │                 │  │
│  │ • View own   │  │ • View all   │  │ • Full access   │  │
│  │   profile    │  │   customers  │  │   to all data   │  │
│  │ • View own   │  │ • View all   │  │ • User mgmt     │  │
│  │   pets       │  │   appts      │  │ • System config │  │
│  │ • View own   │  │ • Create     │  │ • Analytics     │  │
│  │   appts      │  │   appts      │  │ • Staff mgmt    │  │
│  │ • View own   │  │ • Create     │  │ • Service mgmt  │  │
│  │   receipts   │  │   txns       │  │ • Inventory     │  │
│  │              │  │ • View own   │  │   mgmt          │  │
│  │              │  │   schedule   │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Architecture

### Schema Design Principles

1. **Normalization**: 3NF to minimize redundancy
2. **Referential Integrity**: Foreign keys with appropriate cascades
3. **Indexing**: Strategic indexes for performance
4. **Audit Trail**: created_at, updated_at, created_by columns
5. **Soft Deletes**: Where data retention is important
6. **Constraints**: CHECK constraints for data validity

### Entity Relationship Diagram

```
┌──────────────┐
│   profiles   │
│              │
│ • id (PK)    │──────┐
│ • email      │      │
│ • role       │      │
└──────────────┘      │
                      │
       ┌──────────────┴─────────────┐
       │                            │
       │                            │
┌──────▼──────┐              ┌──────▼───────────┐
│  customers  │              │  staff_members   │
│             │              │                  │
│ • id (PK)   │──┐           │ • id (PK)        │──┐
│ • user_id   │  │           │ • user_id        │  │
└─────────────┘  │           └──────────────────┘  │
                 │                                 │
       ┌─────────┴────────┐              ┌────────┴────────┐
       │                  │              │                 │
┌──────▼──────┐    ┌──────▼──────┐  ┌───▼────────────┐   │
│    pets     │    │ appointments│  │ staff_schedules│   │
│             │    │             │  └────────────────┘   │
│ • id (PK)   │──┐ │ • id (PK)   │                       │
│ • customer  │  └>│ • customer  │                       │
│   _id (FK)  │    │   _id (FK)  │                       │
└─────────────┘    │ • pet_id    │<──────────────────────┘
                   │   (FK)      │
                   │ • service   │
                   │   _id (FK)  │<──────────┐
                   │ • staff_id  │           │
                   │   (FK)      │           │
                   └─────┬───────┘           │
                         │              ┌────┴──────┐
                         │              │ services  │
                         │              │           │
                         │              │ • id (PK) │
                         │              └───────────┘
                         │
                   ┌─────▼──────────┐
                   │  transactions  │
                   │                │
                   │ • id (PK)      │──┐
                   │ • customer_id  │  │
                   │ • appointment  │  │
                   │   _id (FK)     │  │
                   └────────────────┘  │
                                       │
                             ┌─────────▼───────────┐
                             │ transaction_items   │
                             │                     │
                             │ • transaction_id    │
                             │   (FK)              │
                             └─────────────────────┘
```

## Deployment Architecture

### Environments

1. **Local Development**
   - Local Supabase via CLI (`npx supabase start`)
   - Local React dev server (Vite)
   - Hot reload for rapid iteration

2. **Staging**
   - Dedicated Supabase project
   - Deployed web app (Vercel/Netlify)
   - TestFlight for iOS beta
   - Mirrors production architecture

3. **Production**
   - Supabase project: tuwkdsoiltdboiaghztz
   - Production web deployment
   - App Store for iOS
   - Automated backups enabled
   - Monitoring and alerting

### CI/CD Pipeline

```
┌──────────────┐
│  Git Push    │
│  to Branch   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  GitHub      │
│  Actions     │
│  Triggered   │
└──────┬───────┘
       │
       ├─────────────────┬──────────────┬─────────────────┐
       │                 │              │                 │
       ▼                 ▼              ▼                 ▼
┌──────────┐     ┌───────────┐  ┌────────────┐   ┌──────────┐
│   Lint   │     │Type Check │  │   Tests    │   │  Build   │
│          │     │           │  │            │   │          │
│ ESLint   │     │TypeScript │  │ • Unit     │   │  Vite    │
│          │     │           │  │ • RLS      │   │  Bundle  │
└────┬─────┘     └─────┬─────┘  │ • API      │   └────┬─────┘
     │                 │        └──────┬─────┘        │
     └────────┬────────┴───────────────┘              │
              │                                        │
              ▼                                        │
      ┌───────────────┐                               │
      │ All Checks    │                               │
      │    Pass?      │                               │
      └───────┬───────┘                               │
              │                                        │
              │ Yes                                    │
              ▼                                        │
      ┌───────────────┐                               │
      │  Deploy to    │<──────────────────────────────┘
      │   Staging     │
      └───────┬───────┘
              │
              │ (Manual approval for prod)
              ▼
      ┌───────────────┐
      │  Deploy to    │
      │  Production   │
      └───────────────┘
```

## Performance Considerations

### Frontend Optimization
- Code splitting with dynamic imports
- Lazy loading of routes
- Image optimization
- Service worker caching (PWA)
- Virtual scrolling for large lists

### Database Optimization
- Strategic indexes on frequently queried columns
- Connection pooling via Supabase
- Query optimization (avoid N+1)
- Materialized views for complex reports
- Partitioning for large tables (future)

### API Optimization
- Client-side caching with React Query
- Debouncing search inputs
- Pagination for large datasets
- Realtime only where needed
- Batching of requests

## Scalability

### Current Architecture Supports
- **Users**: Thousands of concurrent users
- **Data**: Millions of records per table
- **Requests**: ~500 requests/second (Supabase free tier)
- **Storage**: Unlimited (pay-as-you-go)

### Future Scaling Considerations
- **Database**: PostgreSQL read replicas
- **Edge Functions**: Auto-scaling Deno workers
- **CDN**: Global content delivery
- **Monitoring**: Performance metrics and alerting
- **Caching**: Redis for hot data

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups (Supabase)
- **Point-in-Time Recovery**: Available for paid plans
- **Storage**: Versioned objects
- **Code**: Git repository

### Recovery Procedures
1. Database restore from backup
2. Storage file recovery
3. Migration replay if needed
4. Validation of data integrity
5. Monitoring for issues

## Monitoring & Observability

### Metrics Tracked
- **Application**: User activity, error rates, page load times
- **Database**: Query performance, connection pool, row counts
- **API**: Request latency, success rates, rate limit hits
- **Auth**: Sign-in success/failure, session durations

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Retention**: 30 days
- **Error Tracking**: Sentry integration (planned)

### Alerts
- High error rates (>5% in 5 minutes)
- Slow queries (>1 second)
- Failed authentications (>10 in 1 minute)
- Storage quota nearing limit
- Database connection pool exhaustion

## Security Considerations

### OWASP Top 10 Mitigations
1. **Injection**: Parameterized queries, RLS
2. **Broken Auth**: Supabase Auth, PKCE, secure sessions
3. **Sensitive Data Exposure**: HTTPS, encrypted storage
4. **XXE**: No XML parsing
5. **Broken Access Control**: RLS policies, RBAC
6. **Security Misconfiguration**: Secure defaults, env vars
7. **XSS**: React auto-escaping, CSP headers
8. **Insecure Deserialization**: JSON only, validation
9. **Components with Known Vulnerabilities**: Dependabot, npm audit
10. **Insufficient Logging**: Comprehensive audit logs

### Compliance
- **GDPR**: Data retention policies, right to deletion, consent
- **CCPA**: Data access, deletion requests
- **HIPAA**: Not applicable (not healthcare data)
- **PCI DSS**: Payment processing via third-party (Stripe/Square)

## Technology Decisions (ADRs)

Key architectural decisions documented in `/docs/adrs/`:
1. Choice of Supabase over custom backend
2. Row-Level Security vs application-level authorization
3. PostgreSQL triggers vs application-level updates
4. Realtime subscriptions vs polling
5. Edge Functions vs client-side logic

See individual ADR files for detailed rationale.
