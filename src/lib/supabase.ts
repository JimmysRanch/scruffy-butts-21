/**
 * Supabase Client Configuration
 * 
 * This module provides the configured Supabase client for the application.
 * It uses environment variables to configure the client with the correct
 * project URL and anonymous key.
 * 
 * SECURITY NOTES:
 * - Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are exposed to the client
 * - The service role key is NEVER used in client-side code
 * - All data access is controlled by Row-Level Security (RLS) policies
 * - Service role operations must be performed in Edge Functions
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local'
  )
}

/**
 * Main Supabase client instance
 * 
 * This client is configured with:
 * - Automatic session refresh
 * - Persistent auth state in localStorage
 * - TypeScript types from generated database schema
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Helper function to get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Helper function to get current user profile
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Helper function to sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Type exports for convenience
 */
export type { Database }
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']
