# Deployment Guide

Complete guide for deploying the Scruffy Butts application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Storage Configuration](#storage-configuration)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Web App Deployment](#web-app-deployment)
7. [iOS App Deployment](#ios-app-deployment)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Monitoring](#monitoring)

## Prerequisites

### Required Accounts
- [x] Supabase account (free or pro tier)
- [x] GitHub account (for CI/CD)
- [x] Vercel/Netlify account (for web hosting)
- [x] Apple Developer account (for iOS)

### Required Tools
```bash
# Node.js and npm
node --version  # v20+
npm --version   # v10+

# Supabase CLI
npx supabase --version  # v1.200+

# Git
git --version  # v2.40+
```

### Required Credentials
- Supabase Project Ref: `tuwkdsoiltdboiaghztz`
- Supabase URL: `https://tuwkdsoiltdboiaghztz.supabase.co`
- Supabase Anon Key: (from dashboard)
- Supabase Service Role Key: (from dashboard, **never commit**)
- Supabase Access Token: (for CLI, from dashboard)

## Environment Setup

### Development Environment

1. **Clone repository**:
   ```bash
   git clone https://github.com/JimmysRanch/scruffy-butts-21.git
   cd scruffy-butts-21
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create local environment file**:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure `.env.local`**:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Start local Supabase**:
   ```bash
   npx supabase start
   ```

6. **Run migrations**:
   ```bash
   npx supabase db reset
   ```

7. **Start development server**:
   ```bash
   npm run dev
   ```

### Staging Environment

**Separate Supabase Project Recommended**

1. Create staging project in Supabase dashboard
2. Update GitHub secrets with staging credentials
3. Deploy via GitHub Actions workflow

### Production Environment

Use the production Supabase project (tuwkdsoiltdboiaghztz).

## Database Deployment

### Initial Setup

1. **Link to production project**:
   ```bash
   npx supabase link --project-ref tuwkdsoiltdboiaghztz
   ```
   
   Enter your Supabase access token when prompted.

2. **Review pending migrations**:
   ```bash
   npx supabase db diff
   ```

3. **Push migrations**:
   ```bash
   npx supabase db push
   ```

### Verify Migrations

1. **Check migration status**:
   ```bash
   npx supabase migration list
   ```

2. **Verify tables in dashboard**:
   - Go to https://app.supabase.com/project/tuwkdsoiltdboiaghztz/editor
   - Verify all 13 tables exist
   - Check that RLS is enabled on all tables

3. **Test a query**:
   ```bash
   npx supabase db query "SELECT COUNT(*) FROM profiles;"
   ```

### Seed Production Data

**IMPORTANT**: Only seed reference data, never customer/appointment data!

1. **Edit seed file** to include only services and inventory:
   ```bash
   # Remove customer/pet/appointment seeds from seed.sql
   # Keep only services and inventory_items
   ```

2. **Apply seed**:
   ```bash
   psql $DATABASE_URL -f supabase/seed/seed.sql
   ```

   Or via dashboard SQL editor:
   - Copy contents of `supabase/seed/seed.sql`
   - Run in SQL editor at https://app.supabase.com/project/tuwkdsoiltdboiaghztz/sql

## Storage Configuration

### Create Buckets

Buckets are created via migration (`20250103000000_storage_buckets.sql`), but verify:

1. **Check buckets exist**:
   - Go to https://app.supabase.com/project/tuwkdsoiltdboiaghztz/storage/buckets
   - Verify: avatars, pet-photos, receipts

2. **Verify bucket settings**:
   - All buckets should be **private**
   - Check file size limits (5MB for avatars/receipts, 10MB for pet-photos)
   - Check allowed MIME types

3. **Test bucket policies**:
   ```sql
   -- Verify RLS policies exist
   SELECT * FROM pg_policies WHERE tablename = 'objects';
   ```

## Edge Functions Deployment

### Setup

1. **Create functions directory** (if not exists):
   ```bash
   mkdir -p supabase/functions
   ```

2. **Deploy all functions**:
   ```bash
   npx supabase functions deploy
   ```

3. **Deploy specific function**:
   ```bash
   npx supabase functions deploy function-name
   ```

### Set Environment Variables

Functions need access to secrets:

```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
npx supabase secrets set SMTP_HOST=smtp.sendgrid.net
npx supabase secrets set SMTP_PASSWORD=your_smtp_password
```

### Verify Functions

1. **List deployed functions**:
   ```bash
   npx supabase functions list
   ```

2. **Test function**:
   ```bash
   curl -X POST \
     https://tuwkdsoiltdboiaghztz.supabase.co/functions/v1/function-name \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"test": true}'
   ```

3. **Check function logs**:
   - Go to https://app.supabase.com/project/tuwkdsoiltdboiaghztz/functions
   - Select function and view logs

## Web App Deployment

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link project**:
   ```bash
   vercel link
   ```

4. **Set environment variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   ```

   Or via dashboard:
   - Go to project settings → Environment Variables
   - Add: `VITE_SUPABASE_URL` = `https://tuwkdsoiltdboiaghztz.supabase.co`
   - Add: `VITE_SUPABASE_ANON_KEY` = (your anon key)

5. **Deploy**:
   ```bash
   vercel --prod
   ```

### Alternative: Netlify Deployment

1. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "20"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

3. **Set environment variables**:
   - Go to Site settings → Environment variables
   - Add Supabase URL and anon key

### Verify Web Deployment

1. **Visit deployed URL**
2. **Test authentication**:
   - Sign up for new account
   - Verify profile is created
   - Sign in
   - Sign out

3. **Test data access**:
   - Create a customer
   - Create a pet
   - Schedule an appointment
   - Verify RLS policies are working

4. **Test file upload**:
   - Upload an avatar
   - Upload a pet photo
   - Verify files are stored and accessible

## iOS App Deployment

### TestFlight Beta

1. **Archive app in Xcode**:
   - Product → Archive
   - Ensure Release configuration is selected

2. **Upload to App Store Connect**:
   - Window → Organizer → Archives
   - Select archive → Distribute App
   - App Store Connect
   - Upload

3. **Create TestFlight build**:
   - Go to App Store Connect
   - Select app → TestFlight
   - Add build for testing
   - Invite internal testers

4. **Test on real devices**:
   - Download via TestFlight
   - Test all authentication flows
   - Test data CRUD operations
   - Test file uploads/downloads
   - Test realtime subscriptions

### App Store Release

1. **Create app listing**:
   - Screenshots (all device sizes)
   - App description
   - Keywords
   - Privacy policy URL
   - Support URL

2. **Submit for review**:
   - Select build
   - Add what's new
   - Submit for review

3. **Monitor review process**:
   - Typical review: 24-48 hours
   - Address any feedback
   - Release manually or automatically after approval

## Post-Deployment Verification

### Checklist

- [ ] Database tables created and accessible
- [ ] RLS policies enforced correctly
- [ ] Auth flows work (sign up, sign in, sign out)
- [ ] Storage buckets accessible with correct policies
- [ ] Edge Functions responding and logging correctly
- [ ] Web app loads and functions correctly
- [ ] iOS app connects and operates normally
- [ ] Realtime subscriptions working
- [ ] Email notifications sending (if configured)
- [ ] No secrets exposed in client code
- [ ] Performance metrics acceptable (< 1s page load)
- [ ] Error tracking configured (Sentry/similar)
- [ ] Monitoring dashboards set up

### Smoke Tests

Run these after every deployment:

1. **Authentication**:
   ```bash
   curl -X POST \
     https://tuwkdsoiltdboiaghztz.supabase.co/auth/v1/token?grant_type=password \
     -H 'apikey: YOUR_ANON_KEY' \
     -d '{"email":"test@example.com","password":"testpass123"}'
   ```

2. **Database Query**:
   ```bash
   curl -X GET \
     https://tuwkdsoiltdboiaghztz.supabase.co/rest/v1/services?select=*&limit=1 \
     -H 'apikey: YOUR_ANON_KEY' \
     -H 'Authorization: Bearer YOUR_JWT'
   ```

3. **RPC Function**:
   ```bash
   curl -X POST \
     https://tuwkdsoiltdboiaghztz.supabase.co/rest/v1/rpc/get_my_profile \
     -H 'apikey: YOUR_ANON_KEY' \
     -H 'Authorization: Bearer YOUR_JWT'
   ```

4. **Storage Upload**:
   ```bash
   curl -X POST \
     https://tuwkdsoiltdboiaghztz.supabase.co/storage/v1/object/avatars/test.jpg \
     -H 'apikey: YOUR_ANON_KEY' \
     -H 'Authorization: Bearer YOUR_JWT' \
     --data-binary @test.jpg
   ```

## Rollback Procedures

### Database Rollback

**Option 1: Restore from Backup**
1. Go to https://app.supabase.com/project/tuwkdsoiltdboiaghztz/database/backups
2. Select backup before deployment
3. Click "Restore"
4. Confirm restoration

**Option 2: Manual Rollback**
1. Identify problematic migration:
   ```bash
   npx supabase migration list
   ```

2. Create rollback migration:
   ```bash
   npx supabase migration new rollback_migration_name
   ```

3. Write reverse SQL in rollback migration

4. Push rollback:
   ```bash
   npx supabase db push
   ```

### Edge Functions Rollback

1. **Identify previous version**:
   - Check function deployment logs
   - Note previous deployment ID

2. **Redeploy previous version**:
   ```bash
   git checkout <previous-commit>
   npx supabase functions deploy function-name
   git checkout main
   ```

### Web App Rollback

**Vercel**:
1. Go to project deployments
2. Find previous working deployment
3. Click "Promote to Production"

**Netlify**:
1. Go to Deploys
2. Find previous deployment
3. Click "Publish deploy"

### iOS App Rollback

**TestFlight**:
1. Remove problematic build from testing
2. Add previous build back

**App Store**:
1. Create new version with fixes
2. Submit for expedited review
3. OR: If critical, request app removal while fixing

## Monitoring

### Supabase Dashboard

Monitor these metrics:
- https://app.supabase.com/project/tuwkdsoiltdboiaghztz/reports

**Database**:
- Query performance
- Active connections
- Database size
- Slow queries

**API**:
- Request volume
- Error rates
- Response times
- Top endpoints

**Auth**:
- Sign-ups
- Sign-ins
- Failed attempts
- Active users

**Storage**:
- Files uploaded
- Bandwidth used
- Storage quota

### Set Up Alerts

1. **Database alerts**:
   - Slow queries (> 1 second)
   - Connection pool exhaustion
   - High CPU/memory usage

2. **API alerts**:
   - Error rate > 5%
   - Response time > 2 seconds
   - Rate limit hits

3. **Auth alerts**:
   - Failed login spike (> 10 in 1 minute)
   - Unusual signup patterns

### External Monitoring

**Uptime Monitoring**:
- Uptime Robot
- Pingdom
- StatusCake

**Error Tracking**:
- Sentry (for web app)
- Crashlytics (for iOS app)
- Supabase logs (for Edge Functions)

**Performance Monitoring**:
- Google Analytics
- Vercel Analytics
- Sentry Performance

## CI/CD with GitHub Actions

### Required Secrets

Add these to GitHub repository secrets:

```
SUPABASE_ACCESS_TOKEN=your_access_token
SUPABASE_PROJECT_REF=tuwkdsoiltdboiaghztz
VITE_SUPABASE_URL=https://tuwkdsoiltdboiaghztz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### Deployment Flow

1. **Push to main branch** → CI runs
2. **CI passes** → Deploy to staging
3. **Manual approval** → Deploy to production
4. **Tag release** → Automatic production deployment

### Manual Deploy

Trigger deployment manually:

1. Go to https://github.com/JimmysRanch/scruffy-butts-21/actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select environment (staging/production)
5. Click "Run workflow"

## Maintenance

### Regular Tasks

**Daily**:
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Respond to user feedback

**Weekly**:
- [ ] Review slow queries
- [ ] Check storage usage
- [ ] Update dependencies

**Monthly**:
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup verification
- [ ] Cost review

**Quarterly**:
- [ ] Major version updates
- [ ] Infrastructure review
- [ ] Disaster recovery drill
- [ ] Security penetration test

### Troubleshooting

See [Troubleshooting Guide](../README.md#troubleshooting) for common issues and solutions.

---

**For questions or deployment issues, contact**:
- Email: support@scruffybutts.app
- GitHub Issues: https://github.com/JimmysRanch/scruffy-butts-21/issues

**Last Updated**: 2025-01-01  
**Version**: 1.0.0
