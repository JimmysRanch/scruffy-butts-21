# Supabase Integration

This directory contains database migrations and schemas for the Scruffy Butts Supabase integration.

## Migrations

Migrations should be run in order. Each migration file is prefixed with a number indicating the order.

### 001_user_profiles.sql

Creates the `user_profiles` table for storing staff member information with the following features:

- **Table Structure**: Comprehensive staff profile with employment details, compensation settings, and metadata
- **Row Level Security (RLS)**: Policies to control access based on user role and organization
- **Indexes**: Optimized for common queries
- **Triggers**: Automatic timestamp updates
- **Helper Functions**: Utilities for profile creation

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and click **Run**

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Programmatic Migration

You can also run migrations programmatically using the Supabase client in your application startup code.

## Schema Overview

### user_profiles Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| email | TEXT | User email (unique) |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| phone | TEXT | Phone number |
| role | TEXT | User role (admin, manager, groomer, receptionist) |
| organization_id | UUID | Organization identifier |
| address | TEXT | Street address |
| city | TEXT | City |
| state | TEXT | State/province |
| zip | TEXT | Postal code |
| hire_date | DATE | Employment start date |
| position | TEXT | Job position/title |
| status | TEXT | Account status (active, inactive, pending) |
| specialties | TEXT[] | Array of specialties |
| can_be_booked | BOOLEAN | Whether staff can be booked for appointments |
| bookable_services | UUID[] | Array of service IDs this staff can perform |
| commission_enabled | BOOLEAN | Commission pay enabled |
| commission_percent | NUMERIC | Commission percentage |
| hourly_pay_enabled | BOOLEAN | Hourly pay enabled |
| hourly_rate | NUMERIC | Hourly rate |
| salary_enabled | BOOLEAN | Salary pay enabled |
| salary_amount | NUMERIC | Annual salary amount |
| weekly_guarantee_enabled | BOOLEAN | Weekly guarantee enabled |
| weekly_guarantee | NUMERIC | Weekly guaranteed amount |
| guarantee_payout_method | TEXT | How guarantee is calculated (both, higher) |
| notes | TEXT | Additional notes |
| rating | NUMERIC | Performance rating (0-5) |
| metadata | JSONB | Additional custom metadata |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

## RLS Policies

The following Row Level Security policies are applied:

1. **Users can read own profile**: Users can view their own profile data
2. **Users can read profiles in same organization**: Team members can view each other's profiles
3. **Admins and managers can insert profiles**: Only admins/managers can create new staff
4. **Admins and managers can update profiles**: Only admins/managers can update staff in their org
5. **Users can update own profile**: Staff can update limited fields in their own profile (but not role or org)
6. **Only admins can delete profiles**: Only admins can remove staff members

## Adding New Migrations

When adding new migrations:

1. Create a new file: `XXX_description.sql` (increment the number)
2. Document the changes in this README
3. Test the migration on a development Supabase project first
4. Apply to production during a maintenance window if possible

## Rollback

To rollback a migration, you'll need to write a reverse migration. For example:

```sql
-- Rollback for 001_user_profiles.sql
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;
```

**Warning**: Rollbacks can result in data loss. Always backup before running.

## Best Practices

1. **Test First**: Always test migrations on a development project
2. **Backup**: Backup production data before running migrations
3. **Incremental**: Keep migrations small and focused
4. **Idempotent**: Use `IF NOT EXISTS` / `IF EXISTS` for safer migrations
5. **Document**: Update this README when adding migrations
6. **Version Control**: Never modify existing migration files, create new ones instead
