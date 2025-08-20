
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { consultant_id, message, timing, mode } = await request.json()

    if (!consultant_id || !message || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Verify user is a company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can send inquiries' },
        { status: 403 }
      )
    }

    // Create the inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        company_id: user.id,
        consultant_id,
        message,
        timing: timing || null,
        mode,
        status: 'sent'
      })
      .select()
      .single()

    if (inquiryError) {
      throw inquiryError
    }

    return NextResponse.json({
      message: 'Inquiry sent successfully',
      inquiry
    })

  } catch (error: any) {
    console.error('Inquiry creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
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

    let query

    if (userData.role === 'company') {
      // Company sees their sent inquiries
      query = supabase
        .from('inquiries')
        .select(`
          *,
          consultant:users!inquiries_consultant_id_fkey (
            id,
            name,
            email,
            consultant_profiles (
              headline,
              verified
            )
          )
        `)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false })
    } else if (userData.role === 'consultant') {
      // Consultant sees inquiries sent to them
      query = supabase
        .from('inquiries')
        .select(`
          *,
          company:users!inquiries_company_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('consultant_id', user.id)
        .order('created_at', { ascending: false })
    } else if (userData.role === 'admin') {
      // Admin sees all inquiries
      query = supabase
        .from('inquiries')
        .select(`
          *,
          company:users!inquiries_company_id_fkey (
            id,
            name,
            email
          ),
          consultant:users!inquiries_consultant_id_fkey (
            id,
            name,
            email,
            consultant_profiles (
              headline,
              verified
            )
          )
        `)
        .order('created_at', { ascending: false })
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      )
    }

    const { data: inquiries, error: inquiriesError } = await query

    if (inquiriesError) {
      throw inquiriesError
    }

    return NextResponse.json({ inquiries })

  } catch (error: any) {
    console.error('Inquiries fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
