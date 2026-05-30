import { NextRequest, NextResponse } from 'next/server'
import { getCases, getCaseById, getCaseMessages, updateCaseStatus } from '@/lib/hermes/db'
import { sendCaseResponse } from '@/lib/hermes/agent'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const status = searchParams.get('status') as any
  const withMessages = searchParams.get('messages') === 'true'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

  if (id) {
    const caseRecord = await getCaseById(id)
    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (withMessages) {
      const messages = await getCaseMessages(id)
      return NextResponse.json({ case: caseRecord, messages })
    }

    return NextResponse.json({ case: caseRecord })
  }

  const cases = await getCases(limit, status)
  return NextResponse.json({ cases, total: cases.length })
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, status, draft_response, assigned_to } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 })
    }

    const ok = await updateCaseStatus(id, status, { draft_response, assigned_to })
    if (!ok) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id, status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { caseId, body: responseBody } = body

    if (!caseId || !responseBody) {
      return NextResponse.json({ error: 'caseId and body required' }, { status: 400 })
    }

    const ok = await sendCaseResponse(caseId, responseBody)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to send response' }, { status: 500 })
    }

    return NextResponse.json({ success: true, caseId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Send failed' }, { status: 500 })
  }
}
