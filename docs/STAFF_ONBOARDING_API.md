# Staff Onboarding API Implementation

This document provides a quick reference for using the automated staff onboarding system.

## Quick Start

### 1. Prerequisites
- Supabase project created
- Environment variables configured (see `.env.example`)
- Database migration run (see `supabase/migrations/001_user_profiles.sql`)

### 2. API Endpoint

**POST** `/api/staff/onboard`

### 3. Minimal Example

```javascript
const response = await fetch('/api/staff/onboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newstaff@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'groomer',
    organization_id: 'your-org-uuid-here'
  })
});

const result = await response.json();
console.log(result);
```

### 4. Full Example with Optional Fields

```javascript
const response = await fetch('/api/staff/onboard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Required fields
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'groomer', // admin | manager | groomer | receptionist
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    
    // Optional contact info
    phone: '+1-555-123-4567',
    address: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    
    // Optional employment details
    position: 'Senior Groomer',
    hire_date: '2024-01-15',
    specialties: ['Poodles', 'Large Breeds', 'Hand Stripping'],
    can_be_booked: true,
    bookable_services: ['service-uuid-1', 'service-uuid-2'],
    
    // Optional compensation
    commission_enabled: true,
    commission_percent: 15,
    hourly_pay_enabled: false,
    hourly_rate: 0,
    salary_enabled: false,
    salary_amount: 0,
    weekly_guarantee_enabled: true,
    weekly_guarantee: 500,
    guarantee_payout_method: 'higher', // 'both' | 'higher'
    
    // Optional metadata
    notes: 'Specializes in difficult breeds',
    metadata: {
      customField1: 'value1',
      customField2: 'value2'
    },
    
    // Email settings
    send_welcome_email: true // default: true
  })
});

const result = await response.json();
```

## Response Format

### Success (200)

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "jane.smith@example.com",
    "profile": {
      "id": "user-uuid",
      "email": "jane.smith@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "groomer",
      "status": "pending",
      "organization_id": "org-uuid",
      ...
    }
  },
  "message": "Staff member Jane Smith successfully onboarded"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Failed to create user profile",
  "details": "Detailed error message"
}
```

## Using the Example Component

A complete frontend form component is provided in `src/components/StaffOnboardingExample.tsx`:

```tsx
import StaffOnboardingExample from '@/components/StaffOnboardingExample'

export default function OnboardingPage() {
  return <StaffOnboardingExample />
}
```

## Testing with cURL

```bash
curl -X POST http://localhost:3000/api/staff/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "groomer",
    "organization_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## What Happens When You Call the API

1. **Input Validation**: The API validates all input fields using Zod schema
2. **Create Auth User**: A Supabase Auth user is created with a temporary secure password
3. **Create User Profile**: A profile record is inserted into the `user_profiles` table
4. **Send Email**: A password reset email is sent to the new user (if enabled)
5. **Return Success**: The API returns the created user and profile data

If any step fails, the API:
- Logs the error with `[Staff Onboarding]` prefix
- Rolls back changes (e.g., deletes auth user if profile creation fails)
- Returns an appropriate error response

## User Workflow After Onboarding

1. **Receives Email**: New staff member receives welcome email with "Set Up My Account" link
2. **Sets Password**: Clicks link and sets their own secure password
3. **Account Activated**: After password reset, their status can be changed from "pending" to "active"
4. **Can Login**: User can now log in with their email and new password

## Common Issues

### "Failed to create auth user"
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify email doesn't already exist
- Check Supabase Auth settings

### "Failed to create user profile"
- Ensure database migration ran successfully
- Verify `organization_id` is valid UUID format
- Check database logs in Supabase dashboard

### Email not sending
- Check Supabase email settings (Auth → Email Templates)
- Verify SMTP configuration
- Check spam folder

## Security Notes

⚠️ **Important**:
- The API route uses the service role key which bypasses RLS
- In production, add authentication to this endpoint
- Only allow admin/manager users to onboard staff
- Rate limit the endpoint to prevent abuse
- Never expose the service role key to the frontend

## Next Steps

1. Add authentication middleware to the API route
2. Create an admin dashboard with the onboarding form
3. Set up monitoring and alerting
4. Customize email templates in Supabase
5. Add rate limiting

## Documentation

- Full deployment guide: `docs/STAFF_ONBOARDING_DEPLOYMENT.md`
- Database schema: `supabase/README.md`
- Migration file: `supabase/migrations/001_user_profiles.sql`
