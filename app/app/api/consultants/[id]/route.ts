
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const consultantId = params.id
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        consultant_profiles (*)
      `)
      .eq('id', consultantId)
      .eq('role', 'consultant')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      )
    }

    // For public access, only show verified consultants
    const { searchParams } = new URL(request.url)
    const publicView = !searchParams.get('private')

    if (publicView && !data.consultant_profiles?.verified) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ consultant: data })

  } catch (error: any) {
    console.error('Consultant fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const consultantId = params.id
    const { headline, bio, availability, standards, industries, regions, languages, certifications } = await request.json()

    const supabase = createServerSupabaseClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is updating their own profile or is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      throw userError
    }

    const canUpdate = user.id === consultantId || userData.role === 'admin'

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Unauthorized to update this profile' },
        { status: 403 }
      )
    }

    // Update consultant profile
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (headline !== undefined) updateData.headline = headline
    if (bio !== undefined) updateData.bio = bio
    if (availability !== undefined) updateData.availability = availability
    if (standards !== undefined) updateData.standards = standards
    if (industries !== undefined) updateData.industries = industries
    if (regions !== undefined) updateData.regions = regions
    if (languages !== undefined) updateData.languages = languages
    if (certifications !== undefined) updateData.certifications = certifications

    const { data: updatedProfile, error: updateError } = await supabase
      .from('consultant_profiles')
      .update(updateData)
      .eq('user_id', consultantId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
