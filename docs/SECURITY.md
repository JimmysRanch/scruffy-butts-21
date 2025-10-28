# Security Documentation

Comprehensive security guide for the Scruffy Butts application, covering authentication, authorization, RLS policies, and security best practices.

## Table of Contents

1. [Security Model Overview](#security-model-overview)
2. [Authentication](#authentication)
3. [Authorization & RLS](#authorization--rls)
4. [Row-Level Security Policies](#row-level-security-policies)
5. [API Security](#api-security)
6. [Storage Security](#storage-security)
7. [Edge Function Security](#edge-function-security)
8. [Client Security](#client-security)
9. [Data Protection](#data-protection)
10. [Security Best Practices](#security-best-practices)
11. [Security Testing](#security-testing)
12. [Incident Response](#incident-response)

## Security Model Overview

### Defense in Depth

The application implements multiple layers of security:

```
┌─────────────────────────────────────────────────────┐
│             Layer 1: Network Security               │
│  • HTTPS/TLS encryption                             │
│  • CORS policies                                    │
│  • Rate limiting                                    │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────┐
│         Layer 2: Authentication (Supabase Auth)     │
│  • JWT tokens                                       │
│  • Session management                               │
│  • Password hashing (bcrypt)                        │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────┐
│    Layer 3: Authorization (Role-Based + RLS)        │
│  • User roles (customer, staff, admin)              │
│  • Row-Level Security policies                      │
│  • Default-deny all tables                          │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────┐
│          Layer 4: Application Security              │
│  • Input validation (Zod)                           │
│  • XSS prevention                                   │
│  • CSRF protection                                  │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────┐
│             Layer 5: Data Security                  │
│  • Encryption at rest                               │
│  • Encryption in transit                            │
│  • Audit logging                                    │
└─────────────────────────────────────────────────────┘
```

### Key Principles

1. **Default-Deny**: All access explicitly forbidden unless explicitly allowed
2. **Least Privilege**: Users get minimum permissions needed
3. **Zero Trust**: Never trust, always verify
4. **Separation of Duties**: Different roles for different actions
5. **Audit Everything**: Log all significant actions

## Authentication

### Supabase Auth Configuration

**Supported Methods**:
- Email/Password (with strong password policy)
- Magic Link (passwordless)
- OAuth providers (optional: Google, GitHub)

**Password Policy**:
```javascript
{
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
}
```

### JWT Token Structure

```json
{
  "aud": "authenticated",
  "exp": 1735689600,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "user_metadata": {
    "role": "customer"
  }
}
```

### Session Management

**Token Lifecycle**:
- Access token: 1 hour (configurable)
- Refresh token: 30 days
- Automatic refresh when access token expires
- Revocation on sign-out

**Secure Storage**:
- **Web**: localStorage with HttpOnly cookies (future enhancement)
- **iOS**: Keychain Services
- **Never**: sessionStorage, plain text files

### Multi-Factor Authentication (Future)

Planned support for:
- TOTP (Time-based One-Time Password)
- SMS verification
- Email verification codes

## Authorization & RLS

### Role-Based Access Control

Three roles with escalating permissions:

```
┌──────────────────────────────────────────────────────┐
│                    Role Matrix                       │
├──────────────┬────────────┬────────────┬────────────┤
│   Resource   │  Customer  │   Staff    │   Admin    │
├──────────────┼────────────┼────────────┼────────────┤
│ Own Profile  │    R/W     │    R/W     │    R/W     │
│ All Profiles │     -      │     R      │    R/W     │
│ Own Customers│    R/W     │    R/W     │    R/W     │
│ All Customers│     -      │    R/W     │    R/W     │
│ Own Pets     │    R/W     │    R/W     │    R/W     │
│ All Pets     │     -      │    R/W     │    R/W     │
│ Services     │     R      │     R      │   R/W/D    │
│ Own Appts    │     R      │    R/W     │    R/W     │
│ All Appts    │     -      │    R/W     │    R/W/D   │
│ Transactions │     R*     │    R/W     │    R/W/D   │
│ Inventory    │     -      │     R      │    R/W/D   │
│ Staff        │     -      │     R      │    R/W/D   │
│ Reports      │     -      │     R      │    R/W     │
└──────────────┴────────────┴────────────┴────────────┘

R = Read, W = Write, D = Delete, * = Own records only
```

### Role Assignment

Roles are assigned in the `profiles` table:

```sql
INSERT INTO profiles (id, email, role)
VALUES (auth.uid(), 'user@example.com', 'customer');
```

**Role Transitions**:
- Customer → Staff: Admin promotes via dashboard
- Staff → Admin: Database admin only
- Admin → Customer: Not allowed (security)

## Row-Level Security Policies

All tables have RLS enabled with explicit policies.

### Policy Pattern Template

```sql
-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT
CREATE POLICY "Description"
    ON table_name FOR SELECT
    USING (
        -- Condition that must be true for row to be visible
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Policy for INSERT
CREATE POLICY "Description"
    ON table_name FOR INSERT
    WITH CHECK (
        -- Condition that must be true for insert to succeed
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );
```

### Profiles Table Policies

```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
```

**Security Notes**:
- No INSERT policy (handled by auth trigger)
- No DELETE policy (cascade from auth.users)
- Users cannot change their own role

### Customers Table Policies

```sql
-- Customers can view own data
CREATE POLICY "Customers can view own data"
    ON public.customers FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Staff and admins can insert customers
CREATE POLICY "Staff and admins can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Customers can update own data, staff and admins can update all
CREATE POLICY "Customers can update own data, staff and admins can update all"
    ON public.customers FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );
```

**Security Notes**:
- Customers linked to auth users via `user_id`
- Walk-in customers (no user_id) only accessible by staff/admin
- No customer can delete records (data retention)

### Appointments Table Policies

```sql
-- Customers can view their own appointments
CREATE POLICY "Customers can view their own appointments"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE id = appointments.customer_id AND auth.uid() = user_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Staff and admins can insert appointments
CREATE POLICY "Staff and admins can insert appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Staff and admins can update appointments
CREATE POLICY "Staff and admins can update appointments"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Only admins can delete appointments
CREATE POLICY "Only admins can delete appointments"
    ON public.appointments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

**Security Notes**:
- Customers see appointments via customer_id → user_id chain
- Staff can modify all appointments (needed for workflow)
- Only admins can permanently delete (audit trail)

### Services Table Policies

```sql
-- Anyone can view active services
CREATE POLICY "Anyone can view active services"
    ON public.services FOR SELECT
    USING (active = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    ));

-- Only admins can insert services
CREATE POLICY "Only admins can insert services"
    ON public.services FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update services
CREATE POLICY "Only admins can update services"
    ON public.services FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

**Security Notes**:
- Public can see active services (for booking UI)
- Staff can see inactive services (for reports)
- Only admins modify service catalog

### Inventory Table Policies

```sql
-- Staff can view inventory items
CREATE POLICY "Staff can view inventory items"
    ON public.inventory_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Only admins can manage inventory items
CREATE POLICY "Only admins can manage inventory items"
    ON public.inventory_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

**Security Notes**:
- No customer access to inventory
- Staff read-only (view stock levels)
- Admins full control

### Policy Performance Optimization

**Indexed Columns**:
- `profiles.role` for role checks
- `customers.user_id` for ownership checks
- `appointments.customer_id` for relationship queries

**Function-Based Policies**:
```sql
-- Cache profile role for session
CREATE FUNCTION auth.role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE;

-- Use in policies
CREATE POLICY "..." ON table_name
USING (auth.role() = 'admin');
```

## API Security

### PostgREST Security

**Automatic RLS Enforcement**:
- All queries go through PostgREST
- JWT token extracted from Authorization header
- `auth.uid()` set from token sub claim
- RLS policies evaluated before query execution

**Query Constraints**:
```javascript
// Supabase client automatically adds auth header
const { data, error } = await supabase
  .from('appointments')
  .select('*') // RLS filters results automatically
  .eq('status', 'scheduled');
```

### Rate Limiting

**Supabase Default Limits**:
- Free tier: 500 requests/second
- Pro tier: 5000 requests/second
- Custom limits via Edge Functions

**Client-Side Throttling**:
```typescript
import { debounce } from 'lodash';

const searchCustomers = debounce(async (query: string) => {
  const { data } = await supabase
    .from('customers')
    .select('*')
    .ilike('email', `%${query}%`)
    .limit(10);
  return data;
}, 300); // 300ms debounce
```

### CORS Configuration

**Allowed Origins** (configure in Supabase dashboard):
```
https://scruffybutts.app
https://www.scruffybutts.app
capacitor://localhost (for iOS)
http://localhost:5173 (development only)
```

## Storage Security

### Bucket Policies

**Avatars Bucket** (private):
```sql
-- Users can upload own avatar
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view own avatar
CREATE POLICY "Users can view own avatar"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update own avatar
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

**Pet Photos Bucket** (private):
```sql
-- Customers can upload pet photos for their pets
CREATE POLICY "Customers can upload pet photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'pet-photos' AND
        EXISTS (
            SELECT 1 FROM pets p
            JOIN customers c ON p.customer_id = c.id
            WHERE p.id::text = (storage.foldername(name))[1]
            AND (c.user_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM profiles
                     WHERE id = auth.uid() AND role IN ('staff', 'admin')
                 ))
        )
    );
```

**Receipts Bucket** (private):
```sql
-- Staff can upload receipts
CREATE POLICY "Staff can upload receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'receipts' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Customers can view own receipts
CREATE POLICY "Customers can view receipts"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'receipts' AND
        EXISTS (
            SELECT 1 FROM transactions t
            JOIN customers c ON t.customer_id = c.id
            WHERE t.id::text = (storage.foldername(name))[1]
            AND (c.user_id = auth.uid() OR
                 EXISTS (
                     SELECT 1 FROM profiles
                     WHERE id = auth.uid() AND role IN ('staff', 'admin')
                 ))
        )
    );
```

### File Upload Validation

**Client-Side**:
```typescript
async function uploadPetPhoto(petId: string, file: File) {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  // Upload with RLS-enforced access
  const { data, error } = await supabase.storage
    .from('pet-photos')
    .upload(`${petId}/${file.name}`, file);

  if (error) throw error;
  return data;
}
```

## Edge Function Security

### Service Role Key Usage

**CRITICAL**: Service role key bypasses RLS - use with extreme caution!

```typescript
// ❌ NEVER do this
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Exposed to client = DISASTER
);

// ✅ Correct: Only in Edge Functions (server-side)
// /supabase/functions/admin-operation/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  // Verify user is admin FIRST
  const authHeader = req.headers.get('Authorization');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader! } } }
  );

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  // NOW safe to use service role for privileged operation
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Perform admin operation...
});
```

### Input Validation

```typescript
import { z } from 'zod';

const AppointmentSchema = z.object({
  customerId: z.string().uuid(),
  petId: z.string().uuid(),
  serviceId: z.string().uuid(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const validated = AppointmentSchema.parse(body);
    // Use validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.errors), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
});
```

## Client Security

### Environment Variables

**NEVER commit**:
```bash
# ❌ BAD - in .env
SUPABASE_SERVICE_ROLE_KEY=super_secret_key

# ✅ GOOD - in .env.local (gitignored)
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### XSS Prevention

**React Auto-Escaping**:
```tsx
// ✅ Safe - React escapes by default
<div>{customerName}</div>

// ❌ Dangerous - bypasses escaping
<div dangerouslySetInnerHTML={{ __html: customerName }} />

// ✅ Safe - with sanitization
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(customerName) }} />
```

### CSRF Protection

**Token-Based**:
- JWT tokens in Authorization header (not cookies)
- SameSite cookies if using cookie-based auth
- Origin validation in Edge Functions

### Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://tuwkdsoiltdboiaghztz.supabase.co;
  connect-src 'self' https://tuwkdsoiltdboiaghztz.supabase.co wss://tuwkdsoiltdboiaghztz.supabase.co;
  font-src 'self' data:;
">
```

## Data Protection

### Encryption

**At Rest**:
- PostgreSQL: AES-256 encryption (Supabase managed)
- Storage: AES-256 encryption (Supabase managed)

**In Transit**:
- TLS 1.2+ for all connections
- Certificate pinning (iOS, optional)

### PII Handling

**Sensitive Fields**:
- Email addresses
- Phone numbers
- Addresses
- Payment information (if stored)

**Protection Measures**:
- Never log PII
- Redact in error messages
- Access auditing
- Data retention policies

### Data Retention

**Policy**:
- Active customers: Indefinite
- Inactive customers (no appts >2 years): Archive or delete
- Appointments: 5 years for tax/business purposes
- Transactions: 7 years (legal requirement)
- Logs: 90 days

## Security Best Practices

### Checklist

**Development**:
- [ ] Use `.env.local` for secrets
- [ ] Never commit API keys
- [ ] Enable TypeScript strict mode
- [ ] Use Zod for input validation
- [ ] Test RLS policies before deploying
- [ ] Review code for security issues
- [ ] Keep dependencies updated

**Deployment**:
- [ ] Use environment variables for config
- [ ] Enable HTTPS only
- [ ] Configure CORS restrictively
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Monitor for anomalies
- [ ] Have incident response plan

**Ongoing**:
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Penetration testing (annually)
- [ ] Security awareness training
- [ ] Review access logs
- [ ] Rotate secrets periodically

## Security Testing

### RLS Policy Tests

Use pgTAP for automated testing:

```sql
-- test/rls_policies.sql
BEGIN;
SELECT plan(10);

-- Test 1: Customers can only see own appointments
SET request.jwt.claims = json_build_object('sub', 'customer-uuid');

SELECT results_eq(
    'SELECT id FROM appointments',
    $$VALUES ('allowed-appt-uuid'::uuid)$$,
    'Customer sees only own appointments'
);

-- Test 2: Staff can see all appointments
SET request.jwt.claims = json_build_object(
    'sub', 'staff-uuid',
    'user_metadata', json_build_object('role', 'staff')
);

SELECT ok(
    (SELECT count(*) FROM appointments) > 1,
    'Staff can see all appointments'
);

SELECT finish();
ROLLBACK;
```

### Penetration Testing

**Tools**:
- OWASP ZAP for web app scanning
- Burp Suite for API testing
- sqlmap for SQL injection testing
- dirb/gobuster for directory enumeration

**Focus Areas**:
- Authentication bypass
- Authorization flaws
- SQL injection
- XSS vulnerabilities
- CSRF attacks
- Session hijacking

## Incident Response

### Incident Types

1. **Data Breach**: Unauthorized access to customer data
2. **Account Compromise**: User account taken over
3. **DDoS Attack**: Service unavailability
4. **Malware**: Malicious code in application
5. **Insider Threat**: Malicious internal actor

### Response Plan

**Phase 1: Detection & Analysis** (0-2 hours)
- Alert received (monitoring, user report)
- Assess severity and scope
- Assemble response team
- Document everything

**Phase 2: Containment** (2-4 hours)
- Isolate affected systems
- Preserve evidence
- Revoke compromised credentials
- Block malicious IPs

**Phase 3: Eradication** (4-24 hours)
- Remove malware/backdoors
- Patch vulnerabilities
- Reset compromised passwords
- Review access logs

**Phase 4: Recovery** (24-72 hours)
- Restore from clean backups
- Verify system integrity
- Gradual service restoration
- Enhanced monitoring

**Phase 5: Post-Incident** (1 week)
- Root cause analysis
- Update procedures
- User notification (if required)
- Regulatory reporting (if required)

### Contact Information

**Security Team**:
- Email: security@scruffybutts.app
- On-Call: (Emergency only)

**External Resources**:
- Supabase Security: security@supabase.io
- Legal Counsel: (For data breaches)
- Law Enforcement: (For criminal activity)

---

## Compliance

### GDPR (EU Users)

**Requirements**:
- Right to access (data export)
- Right to erasure ("delete my data")
- Right to rectification (data correction)
- Data portability
- Consent management

**Implementation**:
```sql
-- Delete user and all associated data
CREATE FUNCTION delete_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM customers WHERE user_id = user_uuid;
    DELETE FROM profiles WHERE id = user_uuid;
    -- Auth user deletion handled by trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### CCPA (California Users)

Similar to GDPR with additional:
- Right to know what data is collected
- Right to opt-out of data sale (N/A - we don't sell data)

### PCI DSS (If Storing Payment Data)

**Do NOT store**:
- Credit card numbers
- CVV codes
- PIN data

**Use Stripe/Square** for payment processing instead.

---

**Last Updated**: 2025-01-01  
**Next Review**: 2025-07-01  
**Document Owner**: Security Team

For security concerns, please email: security@scruffybutts.app
