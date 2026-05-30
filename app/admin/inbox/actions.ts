'use server'

import { revalidatePath } from 'next/cache'
import { updateCaseStatus, getCaseById } from '@/lib/hermes/db'
import { sendCaseResponse } from '@/lib/hermes/agent'
import { getCurrentAdmin } from '@/app/admin/actions'

export async function replyToCase(caseId: string, body: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const caseRecord = await getCaseById(caseId)
  if (!caseRecord) throw new Error('Case not found')

  const ok = await sendCaseResponse(caseId, body)
  if (!ok) throw new Error('Failed to send response')

  revalidatePath(`/admin/inbox/${caseId}`)
  revalidatePath('/admin/inbox')
  return { success: true }
}

export async function updateStatus(caseId: string, status: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const validStatuses = ['new', 'processing', 'draft_ready', 'responded', 'closed', 'spam'] as const
  if (!validStatuses.includes(status as any)) {
    throw new Error('Invalid status')
  }

  const ok = await updateCaseStatus(caseId, status as any)
  if (!ok) throw new Error('Update failed')

  revalidatePath(`/admin/inbox/${caseId}`)
  revalidatePath('/admin/inbox')
  return { success: true }
}

export async function updateDraft(caseId: string, draft: string) {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')

  const ok = await updateCaseStatus(caseId, 'draft_ready', { draft_response: draft })
  if (!ok) throw new Error('Update failed')

  revalidatePath(`/admin/inbox/${caseId}`)
  return { success: true }
}
