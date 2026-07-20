'use client';

import { useCallback, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Message, SessionUser } from '@/types';

interface ChatViewProps {
  currentUser: SessionUser;
  partnerUser: SessionUser;
  accessToken: string;
  initialMessages: Message[];
}

export function ChatView({
  currentUser,
  partnerUser,
  accessToken,
  initialMessages,
}: ChatViewProps) {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  return (
    <AuthProvider
      currentUser={currentUser}
      partnerUser={partnerUser}
      accessToken={accessToken}
    >
      <div className="flex h-dvh flex-col">
        <ChatHeader
          partnerName={partnerUser.name}
          onSearchToggle={() => setSearchOpen(!searchOpen)}
        />

        <MessageList
          initialMessages={initialMessages}
          currentUserId={currentUser.id}
          partnerName={partnerUser.name}
          onReply={handleReply}
        />

        <MessageInput
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          currentUserId={currentUser.id}
          partnerName={partnerUser.name}
        />
      </div>
    </AuthProvider>
  );
}
