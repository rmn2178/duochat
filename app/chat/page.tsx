import { redirect } from 'next/navigation';
import { getSessionUser, getPartnerConfig, getSessionToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';
import { ChatView } from '@/components/chat/ChatView';
import type { Message } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat — Duo Chat',
};

export default async function ChatPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const partner = getPartnerConfig(user.id);
  if (!partner) {
    redirect('/login');
  }

  // Fetch initial messages (most recent 40)
  const supabase = createServerSupabase(token);
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(40);

  // Filter out messages deleted for this user, reverse to chronological order
  const filteredMessages = (messages || [])
    .filter((msg: Message) => !msg.deleted_for?.includes(user.id))
    .reverse();

  return (
    <ChatView
      currentUser={user}
      partnerUser={{ id: partner.id, name: partner.name }}
      accessToken={token}
      initialMessages={filteredMessages}
    />
  );
}
