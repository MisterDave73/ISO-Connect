
import { Suspense } from 'react'
import ConsultantsDirectory from '@/components/consultants-directory'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ConsultantWithProfile } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

async function getVerifiedConsultants(): Promise<ConsultantWithProfile[]> {
  // Check if Supabase is configured before attempting to create client
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'

  if (!isConfigured) {
    console.warn('Supabase is not configured. Returning empty consultant list.')
    return []
  }

  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        consultant_profiles (*)
      `)
      .eq('role', 'consultant')
      .eq('consultant_profiles.verified', true)

    if (error) {
      console.error('Error fetching consultants:', error)
      return []
    }

    return data?.filter((user: any) => user.consultant_profiles) || []
  } catch (error) {
    console.error('Error fetching consultants:', error)
    return []
  }
}

export default async function ConsultantsPage() {
  const consultants = await getVerifiedConsultants()

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <ConsultantsDirectory initialConsultants={consultants} />
      </Suspense>
    </div>
  )
}
