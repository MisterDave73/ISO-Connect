
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseServiceKey !== 'placeholder-service-key'

// Client-side Supabase client
export const createSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Please check your environment variables.')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Admin client with service role key (for server-side admin operations)
export const createAdminSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Please check your environment variables.')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
