import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-keys';
import { getAllEmails, getEmailById, markEmailRead, deleteEmail } from '@/lib/email-db';

/* ─── Agent email read API ───
 * GET  /api/email            → list emails (add ?unread=true to filter)
 * GET  /api/email?id=XXX     → single email
 * PATCH /api/email?id=XXX    → mark read/unread (body: { read: boolean })
 * DELETE /api/email?id=XXX   → delete email
 *
 * All endpoints require x-api-key header.
 */

async function requireAuth(request: Request): Promise<NextResponse | null> {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }
  const valid = await validateApiKey(apiKey);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const unreadOnly = searchParams.get('unread') === 'true';

  if (id) {
    const email = await getEmailById(id);
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }
    return NextResponse.json({ email });
  }

  let emails = await getAllEmails();
  if (unreadOnly) {
    emails = emails.filter((e) => !e.read);
  }

  // Return lightweight list (omit html to keep payload small)
  const list = emails.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    subject: e.subject,
    receivedAt: e.receivedAt,
    read: e.read,
    preview: e.text ? e.text.slice(0, 200) : undefined,
  }));

  return NextResponse.json({ emails: list, total: emails.length });
}

export async function PATCH(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const read = body.read;
    if (typeof read !== 'boolean') {
      return NextResponse.json({ error: 'read (boolean) is required' }, { status: 400 });
    }

    const ok = await markEmailRead(id, read);
    if (!ok) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id, read });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const ok = await deleteEmail(id);
  if (!ok) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, id, action: 'deleted' });
}
