
import { notFound } from 'next/navigation'
import ConsultantProfile from '@/components/consultant-profile'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ConsultantWithProfile } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

interface ConsultantPageProps {
  params: {
    id: string
  }
}

async function getConsultant(id: string): Promise<ConsultantWithProfile | null> {
  // Check if Supabase is configured before attempting to create client
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'

  if (!isConfigured) {
    console.warn('Supabase is not configured. Cannot fetch consultant.')
    return null
  }

  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        consultant_profiles (*)
      `)
      .eq('id', id)
      .eq('role', 'consultant')
      .eq('consultant_profiles.verified', true)
      .single()

    if (error || !data || !data.consultant_profiles) {
      return null
    }

    return data as ConsultantWithProfile
  } catch (error) {
    console.error('Error fetching consultant:', error)
    return null
  }
}

export default async function ConsultantPage({ params }: ConsultantPageProps) {
  const consultant = await getConsultant(params.id)

  if (!consultant) {
    notFound()
  }

  return <ConsultantProfile consultant={consultant} />
}
