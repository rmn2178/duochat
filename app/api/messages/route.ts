import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, getSessionToken, getPartnerConfig } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { z } from 'zod';

const messageSchema = z.object({
  type: z.enum(['text', 'image', 'audio']).default('text'),
  text: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  audio_url: z.string().url().optional().nullable(),
  audio_duration_ms: z.number().int().positive().optional().nullable(),
  reply_to_id: z.string().uuid().optional().nullable(),
}).refine(data => {
  if (data.type === 'text' && (!data.text || !data.text.trim())) return false;
  if (data.type === 'image' && !data.image_url) return false;
  if (data.type === 'audio' && !data.audio_url) return false;
  return true;
}, { message: "Invalid payload for the specified message type" });

/**
 * GET /api/messages — Paginated message history
 * Query params: ?cursor=<ISO timestamp>&limit=40
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabase(token);
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '40'), 100);
  const search = searchParams.get('q');

  let query = supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  if (search) {
    query = query.ilike('text', `%${search}%`);
  }

  const { data: messages, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  // Filter out messages deleted for this user
  const filtered = (messages || []).filter(
    (msg) => !msg.deleted_for?.includes(user.id)
  );

  return NextResponse.json({
    messages: filtered,
    hasMore: (messages || []).length === limit,
  });
}

/**
 * POST /api/messages — Send a new message
 */
export async function POST(request: NextRequest) {
  // CSRF Protection
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const partner = getPartnerConfig(user.id);
  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 500 });
  }

  const supabase = createServerSupabase(token);
  const body = await request.json();

  try {
    const parsed = messageSchema.parse(body);

    const messageData = {
      sender_id: user.id, // Always forced server-side
      receiver_id: partner.id,
      type: parsed.type,
      text: parsed.text?.trim() || null,
      image_url: parsed.image_url || null,
      audio_url: parsed.audio_url || null,
      audio_duration_ms: parsed.audio_duration_ms || null,
      reply_to_id: parsed.reply_to_id || null,
    };

  const { data: message, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ message: message }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload', details: (err as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
