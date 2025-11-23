import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (uses anon key)
// This client respects Row Level Security (RLS) policies
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Server-side admin client (uses service role key)
// This should ONLY be used in API routes or server-side code
// It bypasses Row Level Security (RLS) policies
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Types for user profiles
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'admin' | 'manager' | 'groomer' | 'receptionist'
  organization_id: string
  
  // Address information
  address?: string
  city?: string
  state?: string
  zip?: string
  
  // Employment details
  hire_date?: string
  position?: string
  status: 'active' | 'inactive' | 'pending'
  
  // Grooming specialties and skills
  specialties?: string[]
  can_be_booked?: boolean
  bookable_services?: string[]
  
  // Compensation settings
  commission_enabled?: boolean
  commission_percent?: number
  hourly_pay_enabled?: boolean
  hourly_rate?: number
  salary_enabled?: boolean
  salary_amount?: number
  weekly_guarantee_enabled?: boolean
  weekly_guarantee?: number
  guarantee_payout_method?: 'both' | 'higher'
  
  // Additional metadata
  notes?: string
  rating?: number
  metadata?: Record<string, any>
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface CreateUserProfileInput {
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: 'admin' | 'manager' | 'groomer' | 'receptionist'
  organization_id: string
  
  // Optional fields
  address?: string
  city?: string
  state?: string
  zip?: string
  hire_date?: string
  position?: string
  specialties?: string[]
  can_be_booked?: boolean
  bookable_services?: string[]
  commission_enabled?: boolean
  commission_percent?: number
  hourly_pay_enabled?: boolean
  hourly_rate?: number
  salary_enabled?: boolean
  salary_amount?: number
  weekly_guarantee_enabled?: boolean
  weekly_guarantee?: number
  guarantee_payout_method?: 'both' | 'higher'
  notes?: string
  metadata?: Record<string, any>
}
