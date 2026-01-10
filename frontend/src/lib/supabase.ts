import { createClient } from '@supabase/supabase-js'

// Supabase URL and keys from Vercel environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_spivot_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_spivot_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (for API routes)
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.spivot_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.spivot_SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, serviceKey)
}
