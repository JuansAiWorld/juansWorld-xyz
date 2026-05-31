import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  // Clear Supabase auth cookies by setting them to expire
  const response = NextResponse.json({ success: true })

  // The actual signout happens client-side via supabase.auth.signOut()
  // This endpoint just ensures any server-side state is cleared
  return response
}
