import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role (bypasses RLS)
// Lazy initialization to avoid errors during build time
let supabaseServerInstance: SupabaseClient | null = null

function getSupabaseServer(): SupabaseClient {
  if (supabaseServerInstance) {
    return supabaseServerInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    // During build time, return a mock client to prevent errors
    if (process.env.NODE_ENV === 'production' && !process.env.RAILWAY_ENVIRONMENT) {
      console.warn('Supabase environment variables not available during build')
      return createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    throw new Error('Missing Supabase server environment variables')
  }

  // This client bypasses Row Level Security and should only be used in API routes
  supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return supabaseServerInstance
}

// Export getter function instead of direct instance
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    try {
      const client = getSupabaseServer()
      return (client as any)[prop]
    } catch (error) {
      console.warn('Supabase server client error:', error)
      return () => Promise.resolve({ data: null, error: 'Database not configured' })
    }
  }
})
