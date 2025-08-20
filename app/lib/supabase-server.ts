
import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseServiceKey !== 'placeholder-service-key'

// Server-side Supabase client
export const createServerSupabaseClient = () => 
  createServerComponentClient({ cookies })

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
