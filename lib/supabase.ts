import { createBrowserClient } from '@supabase/ssr'

// Supabase configuration with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a browser client that stores session in cookies (not localStorage)
// This allows the middleware to read the same session
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

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
