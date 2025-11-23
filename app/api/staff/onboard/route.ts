import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, CreateUserProfileInput } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for staff onboarding
const StaffOnboardingSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'manager', 'groomer', 'receptionist']),
  organization_id: z.string().uuid('Invalid organization ID'),
  
  // Optional fields
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  hire_date: z.string().optional(),
  position: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  can_be_booked: z.boolean().optional(),
  bookable_services: z.array(z.string()).optional(),
  commission_enabled: z.boolean().optional(),
  commission_percent: z.number().min(0).max(100).optional(),
  hourly_pay_enabled: z.boolean().optional(),
  hourly_rate: z.number().min(0).optional(),
  salary_enabled: z.boolean().optional(),
  salary_amount: z.number().min(0).optional(),
  weekly_guarantee_enabled: z.boolean().optional(),
  weekly_guarantee: z.number().min(0).optional(),
  guarantee_payout_method: z.enum(['both', 'higher']).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  
  // Whether to send welcome email with password reset link
  send_welcome_email: z.boolean().optional().default(true)
})

type StaffOnboardingInput = z.infer<typeof StaffOnboardingSchema>

/**
 * POST /api/staff/onboard
 * 
 * Creates a new staff member by:
 * 1. Creating a Supabase Auth user with a temporary password
 * 2. Inserting a corresponding row into public.user_profiles
 * 3. Sending a password reset email to the new user
 * 
 * This endpoint uses the Supabase service role key and should only be
 * accessible to authenticated admin/manager users.
 * 
 * Request body should match StaffOnboardingInput schema.
 * 
 * Returns:
 * - 200: Successfully created staff member
 * - 400: Validation error
 * - 500: Server error (with rollback if possible)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = StaffOnboardingSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: parseResult.error.issues 
        },
        { status: 400 }
      )
    }
    
    const validatedData = parseResult.data
    
    // Step 1: Create Supabase Auth user
    // Generate a temporary secure password (user will reset via email)
    const tempPassword = generateSecurePassword()
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        role: validatedData.role,
        organization_id: validatedData.organization_id
      }
    })
    
    if (authError) {
      console.error('[Staff Onboarding] Auth user creation failed:', authError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create auth user', 
          details: authError.message 
        },
        { status: 500 }
      )
    }
    
    if (!authData.user) {
      console.error('[Staff Onboarding] No user returned from auth creation')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create auth user - no user returned' 
        },
        { status: 500 }
      )
    }
    
    const userId = authData.user.id
    console.log(`[Staff Onboarding] Created auth user: ${userId}`)
    
    // Step 2: Create user profile
    const profileData: CreateUserProfileInput = {
      email: validatedData.email,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      phone: validatedData.phone,
      role: validatedData.role,
      organization_id: validatedData.organization_id,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      zip: validatedData.zip,
      hire_date: validatedData.hire_date,
      position: validatedData.position,
      specialties: validatedData.specialties,
      can_be_booked: validatedData.can_be_booked,
      bookable_services: validatedData.bookable_services,
      commission_enabled: validatedData.commission_enabled,
      commission_percent: validatedData.commission_percent,
      hourly_pay_enabled: validatedData.hourly_pay_enabled,
      hourly_rate: validatedData.hourly_rate,
      salary_enabled: validatedData.salary_enabled,
      salary_amount: validatedData.salary_amount,
      weekly_guarantee_enabled: validatedData.weekly_guarantee_enabled,
      weekly_guarantee: validatedData.weekly_guarantee,
      guarantee_payout_method: validatedData.guarantee_payout_method,
      notes: validatedData.notes,
      metadata: validatedData.metadata
    }
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        ...profileData,
        status: 'pending' // User must complete password reset before becoming active
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('[Staff Onboarding] Profile creation failed:', profileError)
      
      // Rollback: Delete the auth user we just created
      console.log('[Staff Onboarding] Rolling back auth user creation...')
      await supabaseAdmin.auth.admin.deleteUser(userId)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create user profile', 
          details: profileError.message 
        },
        { status: 500 }
      )
    }
    
    console.log(`[Staff Onboarding] Created user profile for: ${userId}`)
    
    // Step 3: Send password reset email (welcome email)
    if (validatedData.send_welcome_email) {
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: validatedData.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
        }
      })
      
      if (resetError) {
        console.error('[Staff Onboarding] Failed to send welcome email:', resetError)
        // Don't fail the whole operation if email fails
        return NextResponse.json({
          success: true,
          user: {
            id: userId,
            email: authData.user.email,
            profile
          },
          warning: 'User created but welcome email failed to send'
        })
      }
      
      console.log(`[Staff Onboarding] Sent welcome email to: ${validatedData.email}`)
    }
    
    // Step 4: Success response
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authData.user.email,
        profile
      },
      message: `Staff member ${validatedData.first_name} ${validatedData.last_name} successfully onboarded`
    })
    
  } catch (error) {
    console.error('[Staff Onboarding] Unexpected error:', error)
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate a secure random password
 * This is only used temporarily - user will reset via email
 */
function generateSecurePassword(): string {
  const length = 32
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Use crypto.getRandomValues for cryptographically secure random numbers
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length]
  }
  
  return password
}
