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
    const client = getSupabaseServer()
    return (client as any)[prop]
  }
})
