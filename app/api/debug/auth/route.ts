import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const debug: any = {
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
      service: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
    },
    cookies: [],
    auth: null,
    error: null,
  }

  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    debug.cookies = allCookies.map((c) => ({
      name: c.name,
      value: c.value.slice(0, 20) + '...',
    }))

    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      debug.auth = { status: 'error', message: error.message }
    } else if (data.user) {
      debug.auth = {
        status: 'authenticated',
        id: data.user.id,
        email: data.user.email,
      }
    } else {
      debug.auth = { status: 'no user' }
    }
  } catch (err: any) {
    debug.error = err.message || String(err)
  }

  return NextResponse.json(debug)
}
