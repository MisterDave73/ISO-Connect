
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { verified } = await request.json()
    const consultantId = params.id

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid verified status' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Get the authenticated user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Update consultant verification status
    const { data: updatedProfile, error: updateError } = await supabase
      .from('consultant_profiles')
      .update({ 
        verified,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', consultantId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      message: `Consultant ${verified ? 'verified' : 'unverified'} successfully`,
      profile: updatedProfile
    })

  } catch (error: any) {
    console.error('Verification update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
