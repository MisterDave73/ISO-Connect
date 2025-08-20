
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const standard = searchParams.get('standard')
    const industry = searchParams.get('industry')
    const region = searchParams.get('region')
    const search = searchParams.get('search')

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('users')
      .select(`
        *,
        consultant_profiles (*)
      `)
      .eq('role', 'consultant')
      .eq('consultant_profiles.verified', true)

    // Apply filters
    if (standard && standard !== 'all') {
      query = query.contains('consultant_profiles.standards', [standard])
    }

    if (industry && industry !== 'all') {
      query = query.contains('consultant_profiles.industries', [industry])
    }

    if (region && region !== 'all') {
      query = query.contains('consultant_profiles.regions', [region])
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,consultant_profiles.headline.ilike.%${search}%,consultant_profiles.bio.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Filter out consultants without profiles
    const consultants = data?.filter(user => user.consultant_profiles) || []

    return NextResponse.json({ consultants })

  } catch (error: any) {
    console.error('Consultants fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
