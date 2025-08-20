
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or home page
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
