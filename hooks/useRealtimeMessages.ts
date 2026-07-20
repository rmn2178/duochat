'use client';

import { useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Message } from '@/types';

interface UseRealtimeMessagesOptions {
  onInsert: (message: Message) => void;
  onUpdate: (message: Message) => void;
  currentUserId: string;
}

export function useRealtimeMessages({
  onInsert,
  onUpdate,
  currentUserId,
}: UseRealtimeMessagesOptions) {
  const { supabase } = useAuthContext();
  const callbacksRef = useRef({ onInsert, onUpdate });

  // Keep callbacks fresh without re-subscribing
  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate };
  }, [onInsert, onUpdate]);

  useEffect(() => {
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only handle messages involving the current user
          if (
            newMessage.sender_id === currentUserId ||
            newMessage.receiver_id === currentUserId
          ) {
            // Don't add our own messages (handled optimistically)
            if (newMessage.sender_id !== currentUserId) {
              callbacksRef.current.onInsert(newMessage);

              // Auto-mark as delivered and read if the chat is visible
              if (document.visibilityState === 'visible') {
                // Mark as read (which also sets delivered)
                fetch(`/api/messages/${newMessage.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'read' }),
                }).catch(console.error);
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          if (
            updatedMessage.sender_id === currentUserId ||
            updatedMessage.receiver_id === currentUserId
          ) {
            callbacksRef.current.onUpdate(updatedMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId]);
}
