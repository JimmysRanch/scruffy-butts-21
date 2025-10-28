# Database Schema Documentation

Complete reference for the Scruffy Butts PostgreSQL database schema.

## Overview

The database is built on PostgreSQL 17 with the following design principles:

- **Third Normal Form (3NF)**: Minimal redundancy
- **Row-Level Security (RLS)**: Default-deny with explicit policies
- **Audit Trails**: Automatic tracking of created/updated timestamps
- **Referential Integrity**: Foreign keys with appropriate cascades
- **Performance**: Strategic indexes on frequently queried columns

## Schema Version

**Current Version**: `20250101000000_initial_schema.sql`  
**Supabase Project**: tuwkdsoiltdboiaghztz

## Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Cryptographic functions
```

## Tables

### 1. profiles

Extends `auth.users` with additional profile information.

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: User profile data and role-based access control

**Relationships**:
- One-to-one with `auth.users`
- One-to-many with `customers` (via user_id)
- One-to-many with `staff_members` (via user_id)

**Indexes**:
- Primary key on `id`
- Unique index on `email`

**RLS Policies**:
- Users can view own profile
- Users can update own profile

---

### 2. customers

Customer information for the grooming business.

```sql
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
```

**Purpose**: Store customer contact and address information

**Relationships**:
- Many-to-one with `profiles` (optional, via user_id)
- One-to-many with `pets`
- One-to-many with `appointments`
- One-to-many with `transactions`

**Indexes**:
- `idx_customers_user_id` on `user_id`
- `idx_customers_email` on `email`
- `idx_customers_created_at` on `created_at DESC`

**RLS Policies**:
- Customers can view own data (where user_id matches)
- Staff and admins can view all customers
- Staff and admins can insert customers
- Customers can update own data, staff/admins can update all

---

### 3. pets

Pet profiles linked to customers.

```sql
CREATE TABLE public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Track pet information and grooming history

**Relationships**:
- Many-to-one with `customers`
- One-to-many with `appointments`

**Indexes**:
- `idx_pets_customer_id` on `customer_id`

**RLS Policies**:
- Users can view pets for their customers (follows customer access)
- Staff and admins can insert pets
- Users can update pets for their customers
- Users can delete pets for their customers

**Constraints**:
- `size` must be 'small', 'medium', or 'large'
- CASCADE delete when customer is deleted

---

### 4. services

Catalog of grooming services offered.

```sql
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Service catalog with pricing and duration

**Relationships**:
- One-to-many with `appointments`
- Many-to-many with `staff_members` (via `staff_service_availability`)

**Indexes**:
- `idx_services_category` on `category`
- `idx_services_active` on `active`

**RLS Policies**:
- Anyone can view active services
- Staff can view all services (including inactive)
- Only admins can insert/update services

**Business Logic**:
- Duration in minutes (e.g., 60, 90, 120)
- Price in USD (decimal for precision)
- Categories: 'Full Groom', 'Bath & Brush', 'Add-On', 'Special'

---

### 5. staff_members

Staff information and configuration.

```sql
CREATE TABLE public.staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    hire_date DATE NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    specialties TEXT[] DEFAULT '{}',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    color TEXT, -- for calendar display
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Team member profiles and capabilities

**Relationships**:
- Many-to-one with `profiles` (optional, via user_id)
- One-to-many with `appointments`
- One-to-many with `staff_schedules`
- One-to-many with `staff_time_off`
- Many-to-many with `services` (via `staff_service_availability`)

**Indexes**:
- `idx_staff_members_user_id` on `user_id`
- `idx_staff_members_status` on `status`
- `idx_staff_members_email` on `email`

**RLS Policies**:
- Staff can view all staff members
- Only admins can insert staff members
- Admins can update all, staff can update own record (via user_id)

**Business Logic**:
- `specialties` is array (e.g., ['Small Dogs', 'Show Cuts', 'Hand Stripping'])
- `color` used for calendar visual differentiation
- `rating` on scale 0.00 to 5.00

---

### 6. staff_service_availability

Tracks which services each staff member can perform.

```sql
CREATE TABLE public.staff_service_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(staff_id, service_id)
);
```

**Purpose**: Staff service capabilities matrix

**Relationships**:
- Many-to-one with `staff_members`
- Many-to-one with `services`

**Indexes**:
- `idx_staff_service_staff_id` on `staff_id`
- `idx_staff_service_service_id` on `service_id`
- Unique constraint on (staff_id, service_id)

**RLS Policies**:
- Staff can view service availability
- Only admins can manage service availability

---

### 7. appointments

Core appointment scheduling and tracking.

```sql
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'confirmed', 'checked-in', 'in-progress', 
                   'ready-for-pickup', 'completed', 'cancelled', 'no-show')
    ),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    confirmation_sent BOOLEAN DEFAULT false,
    pickup_notification_sent BOOLEAN DEFAULT false,
    customer_arrived BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
```

**Purpose**: Appointment booking and lifecycle tracking

**Relationships**:
- Many-to-one with `customers`
- Many-to-one with `pets`
- Many-to-one with `services`
- Many-to-one with `staff_members` (optional)
- One-to-one with `transactions` (via appointment_id)

**Indexes**:
- `idx_appointments_customer_id` on `customer_id`
- `idx_appointments_pet_id` on `pet_id`
- `idx_appointments_staff_id` on `staff_id`
- `idx_appointments_date` on `appointment_date DESC`
- `idx_appointments_status` on `status`
- `idx_appointments_date_time` on `(appointment_date, start_time)`

**RLS Policies**:
- Customers can view their own appointments
- Staff and admins can view all appointments
- Staff and admins can insert/update appointments
- Only admins can delete appointments

**Status Workflow**:
1. `scheduled` → Initial booking
2. `confirmed` → Customer confirmed
3. `checked-in` → Customer arrived
4. `in-progress` → Service started
5. `ready-for-pickup` → Service complete, awaiting pickup
6. `completed` → Customer picked up and paid
7. `cancelled` or `no-show` → Terminal states

---

### 8. transactions

Payment and transaction records.

```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tip DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'cashapp', 'chime')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_time TIME NOT NULL DEFAULT CURRENT_TIME,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
```

**Purpose**: Financial transaction records

**Relationships**:
- Many-to-one with `customers` (optional)
- Many-to-one with `appointments` (optional, for appointment checkout)
- Many-to-one with `staff_members` (optional, who processed)
- One-to-many with `transaction_items`

**Indexes**:
- `idx_transactions_customer_id` on `customer_id`
- `idx_transactions_appointment_id` on `appointment_id`
- `idx_transactions_date` on `transaction_date DESC`
- `idx_transactions_created_at` on `created_at DESC`

**RLS Policies**:
- Customers can view their own transactions
- Staff and admins can view all transactions
- Staff and admins can insert transactions
- Only admins can update transactions

**Business Logic**:
- `total` = `subtotal` - `discount` + `tax` + `tip`
- `appointment_id` NULL for walk-in/standalone transactions
- Supports multiple payment methods

---

### 9. transaction_items

Line items for transactions (services and products).

```sql
CREATE TABLE public.transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
    item_id UUID, -- references service or inventory item
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    is_original_appointment_service BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Itemized transaction details

**Relationships**:
- Many-to-one with `transactions`
- Foreign key to `services` or `inventory_items` (via item_id, not enforced)

**Indexes**:
- `idx_transaction_items_transaction_id` on `transaction_id`
- `idx_transaction_items_item_type` on `item_type`

**RLS Policies**:
- Users can view transaction items for their transactions
- Staff and admins can manage transaction items

**Business Logic**:
- `total_price` = `quantity` * `unit_price`
- `is_original_appointment_service` flags the primary service (cannot be removed)

---

### 10. inventory_items

Inventory management for supplies and retail products.

```sql
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN ('shampoo', 'conditioner', 'tools', 'accessories', 'treats', 'retail', 'other')
    ),
    sku TEXT UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'each',
    reorder_level INTEGER NOT NULL DEFAULT 0,
    reorder_quantity INTEGER NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10, 2),
    supplier TEXT,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Stock management and cost tracking

**Relationships**:
- One-to-many with `inventory_transactions`
- Referenced by `transaction_items` (via item_id, not enforced)

**Indexes**:
- `idx_inventory_items_category` on `category`
- `idx_inventory_items_sku` on `sku`
- `idx_inventory_items_active` on `active`

**RLS Policies**:
- Staff can view inventory items
- Only admins can manage inventory items

**Business Logic**:
- `quantity` tracks current stock
- Alert when `quantity` < `reorder_level`
- `selling_price` NULL for internal-use-only items

---

### 11. inventory_transactions

Track inventory changes (restocks, usage, sales, etc.).

```sql
CREATE TABLE public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('restock', 'usage', 'sale', 'adjustment', 'expired', 'damaged')
    ),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    cost DECIMAL(10, 2),
    notes TEXT,
    reference_id UUID, -- could link to transaction or appointment
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
```

**Purpose**: Audit trail for inventory changes

**Relationships**:
- Many-to-one with `inventory_items`
- Soft reference to `transactions` or `appointments` (via reference_id)

**Indexes**:
- `idx_inventory_transactions_item_id` on `item_id`
- `idx_inventory_transactions_created_at` on `created_at DESC`

**RLS Policies**:
- Staff can view inventory transactions
- Staff and admins can insert inventory transactions

**Business Logic**:
- `new_quantity` = `previous_quantity` + `quantity` (negative for usage/sale)
- Automatically update `inventory_items.quantity` via trigger (future enhancement)

---

### 12. staff_schedules

Regular staff scheduling.

```sql
CREATE TABLE public.staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose**: Recurring weekly staff schedules

**Relationships**:
- Many-to-one with `staff_members`

**Indexes**:
- `idx_staff_schedules_staff_id` on `staff_id`
- `idx_staff_schedules_day` on `day_of_week`

**RLS Policies**:
- Staff can view schedules
- Only admins can manage schedules

**Business Logic**:
- `day_of_week`: 0 = Sunday, 6 = Saturday
- Multiple schedules per staff member (split shifts)

---

### 13. staff_time_off

Track staff time off requests and approvals.

```sql
CREATE TABLE public.staff_time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ
);
```

**Purpose**: PTO and vacation tracking

**Relationships**:
- Many-to-one with `staff_members`
- Many-to-one with `profiles` (approver)

**Indexes**:
- `idx_staff_time_off_staff_id` on `staff_id`
- `idx_staff_time_off_dates` on `(start_date, end_date)`
- `idx_staff_time_off_status` on `status`

**RLS Policies**:
- Staff can view own time off requests
- Admins can view all time off requests
- Staff can create own time off requests
- Only admins can approve/deny time off

---

## Functions

### check_appointment_conflict

Check for scheduling conflicts before booking.

```sql
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_staff_id UUID,
    p_appointment_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    IF p_staff_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT COUNT(*) INTO conflict_count
    FROM public.appointments
    WHERE staff_id = p_staff_id
        AND appointment_date = p_appointment_date
        AND status NOT IN ('cancelled', 'no-show', 'completed')
        AND (p_appointment_id IS NULL OR id != p_appointment_id)
        AND (
            (start_time <= p_start_time AND end_time > p_start_time) OR
            (start_time < p_end_time AND end_time >= p_end_time) OR
            (start_time >= p_start_time AND end_time <= p_end_time)
        );

    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage**:
```sql
SELECT check_appointment_conflict(
    'staff-uuid',
    '2025-01-15',
    '10:00'::TIME,
    '11:30'::TIME
);
```

---

## Triggers

### update_updated_at_column

Automatically update `updated_at` timestamp on row updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Applied to**:
- profiles
- customers
- pets
- services
- staff_members
- appointments
- transactions
- inventory_items
- staff_schedules
- staff_time_off

---

## Migrations

### Running Migrations

**Production**:
```bash
npx supabase db push
```

**Local Development**:
```bash
npx supabase db reset
```

### Creating New Migrations

```bash
npx supabase migration new <migration_name>
```

Example:
```bash
npx supabase migration new add_customer_tags
```

### Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

Example: `20250115120000_add_customer_tags.sql`

---

## Seeding Data

### Development Seed

Location: `supabase/seed/seed.sql`

**Includes**:
- Sample services
- Sample inventory items
- Template for customers, pets, appointments (requires auth users)

**Run Seed**:
```bash
psql $DATABASE_URL -f supabase/seed/seed.sql
```

### Production Considerations

- Never seed customer/appointment data in production
- Only seed reference data (services, initial inventory)
- Use migration for essential data

---

## Backup & Restore

### Automated Backups

Supabase provides:
- Daily automated backups (Pro plan)
- Point-in-Time Recovery (Pro plan)
- Manual backup triggers

### Manual Backup

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
psql $DATABASE_URL < backup_20250115.sql
```

---

## Performance Optimization

### Query Optimization

1. **Use indexes** for frequently queried columns
2. **Limit results** with pagination
3. **Avoid N+1 queries** with proper JOINs
4. **Use EXPLAIN ANALYZE** to understand query plans

Example:
```sql
EXPLAIN ANALYZE
SELECT a.*, c.first_name, c.last_name, p.name as pet_name
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN pets p ON a.pet_id = p.id
WHERE a.appointment_date = CURRENT_DATE;
```

### Index Monitoring

```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname NOT IN (
    SELECT indexrelid::regclass::text
    FROM pg_stat_user_indexes
    WHERE idx_scan > 0
);
```

### Slow Query Log

```sql
-- Enable slow query logging
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- 1 second

-- View slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Data Integrity

### Foreign Key Cascades

- `ON DELETE CASCADE`: Child records deleted automatically
- `ON DELETE SET NULL`: FK set to NULL (preserve history)
- `ON DELETE RESTRICT`: Prevent deletion if referenced

**Examples**:
- `pets.customer_id` → CASCADE (delete pets when customer deleted)
- `appointments.customer_id` → CASCADE (delete appointments when customer deleted)
- `appointments.service_id` → RESTRICT (cannot delete active services)
- `appointments.staff_id` → SET NULL (preserve appointment if staff deleted)

### CHECK Constraints

Enforce data validity at database level:

```sql
-- Appointment status must be valid
CHECK (status IN ('scheduled', 'confirmed', 'checked-in', ...))

-- Pet size must be valid
CHECK (size IN ('small', 'medium', 'large'))

-- Staff day_of_week must be 0-6
CHECK (day_of_week BETWEEN 0 AND 6)
```

### Soft Deletes

Consider soft deletes for audit trails:

```sql
ALTER TABLE customers ADD COLUMN deleted_at TIMESTAMPTZ;

-- Query only active records
SELECT * FROM customers WHERE deleted_at IS NULL;
```

---

## Monitoring

### Table Sizes

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Row Counts

```sql
SELECT
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### Active Connections

```sql
SELECT count(*) FROM pg_stat_activity
WHERE state = 'active';
```

---

## Security

See [SECURITY.md](SECURITY.md) for complete RLS policy documentation.

### Key Principles

1. **Default-Deny**: All tables have RLS enabled with no implicit access
2. **Explicit Policies**: Every access pattern requires a policy
3. **Role-Based**: Policies enforce customer/staff/admin roles
4. **Context-Aware**: Policies use `auth.uid()` for user context

### Testing RLS Policies

```sql
-- Test as anonymous user
SET request.jwt.claims = '{}';

-- Test as authenticated customer
SET request.jwt.claims = '{"sub": "user-uuid", "role": "customer"}';

-- Test query
SELECT * FROM appointments; -- Should only see own appointments
```

---

## TypeScript Types

Generate TypeScript types from database schema:

```bash
npx supabase gen types typescript --project-id tuwkdsoiltdboiaghztz > src/lib/database.types.ts
```

Or for local development:

```bash
npx supabase gen types typescript --local > src/lib/database.types.ts
```

**Usage in code**:

```typescript
import type { Database } from '@/lib/database.types'

type Customer = Database['public']['Tables']['customers']['Row']
type NewCustomer = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']
```

---

## Troubleshooting

### Common Issues

1. **RLS Policy Violation**
   - Check user is authenticated: `SELECT auth.uid()`
   - Verify user role: `SELECT role FROM profiles WHERE id = auth.uid()`
   - Review policy: `SELECT * FROM pg_policies WHERE tablename = 'table_name'`

2. **Foreign Key Violation**
   - Ensure referenced record exists
   - Check CASCADE settings
   - Verify column data types match

3. **Unique Constraint Violation**
   - Check for duplicate values (email, sku, etc.)
   - Use `ON CONFLICT` for upserts

4. **Slow Queries**
   - Add indexes on frequently filtered columns
   - Use `EXPLAIN ANALYZE` to understand query plan
   - Consider materialized views for complex reports

---

## Future Enhancements

Potential schema improvements:

1. **Partitioning** for appointments (by date)
2. **Materialized Views** for reporting
3. **Full-text Search** on customer/pet names
4. **Audit Tables** for complete change history
5. **Read Replicas** for analytics queries
6. **Custom Types** for complex data structures

---

For questions or schema change requests, please open an issue in the repository.
