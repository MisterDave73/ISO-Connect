
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const inquiryId = params.id

    if (!status || !['accepted', 'declined', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      throw userError
    }

    // Only consultants can update inquiry status (accept/decline)
    // Only companies can close inquiries
    if (userData.role !== 'consultant' && userData.role !== 'company' && userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to update inquiries' },
        { status: 403 }
      )
    }

    // Get the inquiry to verify ownership
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    // Check if user can update this inquiry
    const canUpdate = 
      (userData.role === 'consultant' && inquiry.consultant_id === user.id) ||
      (userData.role === 'company' && inquiry.company_id === user.id) ||
      userData.role === 'admin'

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Unauthorized to update this inquiry' },
        { status: 403 }
      )
    }

    // Update the inquiry
    const { data: updatedInquiry, error: updateError } = await supabase
      .from('inquiries')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // TODO: Send email notification to admin if inquiry is accepted
    if (status === 'accepted') {
      console.log('TODO: Send email notification to admin about accepted inquiry')
    }

    return NextResponse.json({
      message: 'Inquiry updated successfully',
      inquiry: updatedInquiry
    })

  } catch (error: any) {
    console.error('Inquiry update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
