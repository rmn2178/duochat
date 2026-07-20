import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, getSessionToken, getPartnerConfig } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';

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

  const { type = 'text', text, image_url, audio_url, audio_duration_ms, reply_to_id } = body;

  // Validate
  if (type === 'text' && !text?.trim()) {
    return NextResponse.json({ error: 'Text is required for text messages' }, { status: 400 });
  }
  if (type === 'image' && !image_url) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }
  if (type === 'audio' && !audio_url) {
    return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
  }

  const messageData = {
    sender_id: user.id, // Always forced server-side
    receiver_id: partner.id,
    type,
    text: text?.trim() || null,
    image_url: image_url || null,
    audio_url: audio_url || null,
    audio_duration_ms: audio_duration_ms || null,
    reply_to_id: reply_to_id || null,
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

  return NextResponse.json({ message });
}
