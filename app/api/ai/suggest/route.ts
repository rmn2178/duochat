import { NextResponse } from 'next/server';
import { getSessionUser, getSessionToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { getReplySuggestions } from '@/lib/gemini';

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabase(token);

  // Fetch last 10 messages
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching messages for AI:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ suggestions: ['Hi! 👋', 'Hello!', 'Hey, how are you?'] });
  }

  // Map to the format Gemini expects, only text messages
  const history = messages
    .reverse()
    .filter((msg) => msg.type === 'text' && msg.text && !msg.deleted_for_everyone)
    .map((msg) => ({
      sender: msg.sender_id === user.id ? ('me' as const) : ('them' as const),
      text: msg.text!,
    }));

  if (history.length === 0) {
    return NextResponse.json({ suggestions: ['Hi! 👋', 'Hello!', 'Hey, how are you?'] });
  }

  const suggestions = await getReplySuggestions(history);

  return NextResponse.json({ suggestions });
}
