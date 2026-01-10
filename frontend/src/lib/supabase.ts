import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase URL and keys from Vercel environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_spivot_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_spivot_SUPABASE_ANON_KEY || ''

// Create client only if we have valid URL (prevents build errors)
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Dummy client for build time - will be replaced at runtime
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export { supabase }

// Server-side client (for API routes)
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.spivot_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.spivot_SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!url || !serviceKey) {
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  
  return createClient(url, serviceKey)
}
