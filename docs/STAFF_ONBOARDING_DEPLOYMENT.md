# Staff User Profile Automation - Deployment Guide

This guide explains how to set up and deploy the automated staff onboarding workflow that creates Supabase Auth users and user profiles.

## Overview

The staff onboarding system automates the creation of new staff members by:
1. Creating a Supabase Auth user with a secure temporary password
2. Inserting a corresponding profile record in the `user_profiles` table
3. Sending a welcome email with a password reset link
4. Handling errors with automatic rollback
5. Logging all operations for admin visibility

## Prerequisites

- A Supabase project (create one at https://app.supabase.com)
- Node.js 18+ and npm
- Next.js application (already set up in this project)

## Setup Instructions

### 1. Set Up Supabase Database

1. Log in to your Supabase project dashboard
2. Go to **SQL Editor** in the sidebar
3. Copy the contents of `supabase/migrations/001_user_profiles.sql`
4. Paste into the SQL Editor and click **Run**

This will create:
- The `user_profiles` table with all necessary columns
- Row Level Security (RLS) policies
- Indexes for performance
- Helper functions for profile creation
- Automatic timestamp triggers

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:

   - **NEXT_PUBLIC_SUPABASE_URL**: Found in Project Settings → API → Project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Found in Project Settings → API → Project API keys → anon/public
   - **SUPABASE_SERVICE_ROLE_KEY**: Found in Project Settings → API → Project API keys → service_role
   - **NEXT_PUBLIC_APP_URL**: Your application URL (e.g., `https://yourdomain.com` or `http://localhost:3000` for development)

   **⚠️ Important Security Notes:**
   - The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security policies
   - NEVER expose this key in client-side code or commit it to version control
   - Only use it in API routes (server-side code)
   - The key is only accessible in Next.js API routes and server components

### 3. Configure Email Templates (Optional)

Supabase sends welcome emails automatically when a password reset is requested. You can customize these templates:

1. Go to **Authentication → Email Templates** in your Supabase dashboard
2. Select **Reset Password** template
3. Customize the email content. Here's a suggested template:

```html
<h2>Welcome to Scruffy Butts!</h2>
<p>Hi {{ .Name }},</p>
<p>You've been added as a new team member at Scruffy Butts. To get started, please set up your account by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Set Up My Account</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you have any questions, please contact your manager.</p>
<p>Thank you,<br>The Scruffy Butts Team</p>
```

### 4. Install Dependencies

The required dependencies are already in `package.json`. Run:

```bash
npm install
```

This installs `@supabase/supabase-js` and other necessary packages.

### 5. Build and Test

Build the application to ensure everything compiles:

```bash
npm run build
```

Start the development server:

```bash
npm run dev
```

## API Usage

### Creating a New Staff Member

**Endpoint:** `POST /api/staff/onboard`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "jane.smith@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "role": "groomer",
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "position": "Senior Groomer",
  "hire_date": "2024-01-15",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zip": "62701",
  "specialties": ["Poodles", "Large Breeds", "Hand Stripping"],
  "can_be_booked": true,
  "bookable_services": ["service-uuid-1", "service-uuid-2"],
  "commission_enabled": true,
  "commission_percent": 15,
  "send_welcome_email": true
}
```

**Required Fields:**
- `email`: Valid email address
- `first_name`: Staff member's first name
- `last_name`: Staff member's last name
- `role`: One of `admin`, `manager`, `groomer`, or `receptionist`
- `organization_id`: UUID of the organization (must exist in your system)

**Optional Fields:**
All other fields shown in the example are optional.

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-of-created-user",
    "email": "jane.smith@example.com",
    "profile": {
      "id": "uuid-of-created-user",
      "email": "jane.smith@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "groomer",
      "status": "pending",
      "organization_id": "550e8400-e29b-41d4-a716-446655440000",
      ...
    }
  },
  "message": "Staff member Jane Smith successfully onboarded"
}
```

**Error Responses:**

400 - Validation Error:
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

500 - Server Error:
```json
{
  "success": false,
  "error": "Failed to create user profile",
  "details": "Error message from Supabase"
}
```

## Testing the Workflow

### Using cURL

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

### Using JavaScript/Fetch

```javascript
const response = await fetch('/api/staff/onboard', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'groomer',
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
  }),
});

const result = await response.json();
console.log(result);
```

## Error Handling & Rollback

The system includes comprehensive error handling:

1. **Validation Errors**: If the input data is invalid (e.g., bad email, missing required fields), the API returns a 400 error with details.

2. **Auth User Creation Failure**: If creating the Supabase Auth user fails, the API returns a 500 error immediately.

3. **Profile Creation Failure**: If creating the user profile fails after the auth user is created, the system automatically:
   - Rolls back by deleting the auth user
   - Returns a 500 error with details
   - Logs the rollback operation

4. **Email Sending Failure**: If the welcome email fails to send but the user and profile were created successfully, the API returns a 200 success with a warning message.

All errors are logged to the console with a `[Staff Onboarding]` prefix for easy filtering.

## Monitoring & Admin Notifications

Currently, errors are logged to the application console. For production, you should:

1. **Add Logging Service**: Integrate with a logging service like:
   - Vercel Logs (if deployed on Vercel)
   - DataDog
   - Sentry
   - LogRocket

2. **Add Admin Notifications**: When errors occur, notify admins via:
   - Email alerts
   - Slack/Discord webhooks
   - SMS (for critical errors)

Example Slack notification integration:

```typescript
// Add to app/api/staff/onboard/route.ts after error logging
async function notifyAdminOfError(error: any, context: any) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhook) return;
  
  await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Staff Onboarding Error`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error:* ${error.message}\n*Email:* ${context.email}\n*Time:* ${new Date().toISOString()}`
          }
        }
      ]
    })
  });
}
```

## Row Level Security (RLS) Policies

The `user_profiles` table has the following RLS policies:

1. **Read Own Profile**: Users can read their own profile
2. **Read Organization Profiles**: Users can read profiles of others in their organization
3. **Insert Profiles**: Only admins and managers can create new profiles
4. **Update Profiles**: Admins and managers can update any profile in their org; users can update limited fields in their own profile
5. **Delete Profiles**: Only admins can delete profiles

**Note:** The API route uses the service role key which bypasses RLS. This is necessary for the onboarding workflow since the new user doesn't exist yet.

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel Project Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

### Other Platforms

For other platforms (AWS, Google Cloud, etc.):

1. Ensure Node.js 18+ is available
2. Set environment variables in the platform's configuration
3. Build: `npm run build`
4. Start: `npm run start`

## Security Best Practices

1. ✅ **Environment Variables**: Never commit `.env.local` or expose service role keys
2. ✅ **HTTPS Only**: Always use HTTPS in production
3. ✅ **Rate Limiting**: Add rate limiting to the onboard endpoint to prevent abuse
4. ✅ **Authentication**: Add authentication to ensure only authorized users can onboard staff
5. ✅ **Input Validation**: The API uses Zod for strict input validation
6. ✅ **Audit Logging**: Consider logging all onboarding attempts to an audit table
7. ✅ **Email Verification**: Supabase handles email verification automatically

## Troubleshooting

### "Failed to create auth user"

- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify the email doesn't already exist in auth.users
- Check Supabase Auth settings (Authentication → Settings)

### "Failed to create user profile"

- Ensure the database migration ran successfully
- Check that `organization_id` is a valid UUID
- Verify RLS policies are not blocking the insert (though service role bypasses RLS)

### Welcome email not sending

- Check Supabase email settings (Authentication → Email Templates)
- Verify SMTP is configured in Supabase
- Check spam folders

### Build errors

- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run build`
- Ensure `@supabase/supabase-js` is in package.json dependencies

## Next Steps

After successful deployment:

1. Create your first organization record (if needed)
2. Test the onboarding workflow with a test email
3. Set up authentication for the onboard endpoint
4. Customize email templates in Supabase
5. Add admin notification webhooks
6. Set up monitoring and logging
7. Create a frontend form that calls the API endpoint

## Support

For issues:
- Check Supabase logs: Project → Logs
- Check application logs (console or logging service)
- Review the API response error details
- Ensure all environment variables are set correctly
