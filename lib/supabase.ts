import { createClient } from '@supabase/supabase-js'

// Supabase configuration with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a single supabase client for interacting with your database
// Configure to persist session in localStorage and auto-refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'relicon-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
})

// Database types for type safety
export interface WaitlistSignup {
  id?: number
  name: string
  email: string
  company?: string | null
  monthly_ad_spend?: string | null
  primary_goal?: string | null
  created_at?: string
}

export interface ContactMessage {
  id?: number
  name: string
  email: string
  subject: string
  message: string
  status?: string
  created_at?: string
}
