
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, headline, bio } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['company', 'consultant', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // Create user record in our custom users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        password_hash: passwordHash,
        role,
      })

    if (userError) {
      // If user creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw userError
    }

    // If consultant, create consultant profile
    if (role === 'consultant') {
      const { error: profileError } = await supabase
        .from('consultant_profiles')
        .insert({
          user_id: authData.user.id,
          headline: headline || null,
          bio: bio || null,
          standards: [],
          industries: [],
          certifications: [],
          verified: false,
          regions: [],
          languages: []
        })

      if (profileError) {
        // If profile creation fails, delete the user and auth user
        await supabase.from('users').delete().eq('id', authData.user.id)
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email,
        name,
        role
      }
    })

  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
