import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  return NextResponse.json({
    count: allCookies.length,
    names: allCookies.map((c) => c.name),
    authCookies: allCookies
      .filter((c) => c.name.includes('sb-') && c.name.includes('auth'))
      .map((c) => ({
        name: c.name,
        valuePrefix: c.value.slice(0, 50),
      })),
  })
}
