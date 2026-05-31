'use server'

import { cookies, headers } from 'next/headers'

export async function testServerAction() {
  let cookieNames: string[] = []
  let rawCookieHeader: string | null = null

  try {
    const cookieStore = await cookies()
    cookieNames = cookieStore.getAll().map((c) => c.name)
  } catch (e: any) {
    cookieNames = ['error: ' + e.message]
  }

  try {
    const h = await headers()
    rawCookieHeader = h.get('cookie')
  } catch (e: any) {
    rawCookieHeader = 'error: ' + e.message
  }

  return { cookieNames, rawCookieHeader }
}
