'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface TypingStatusReturn {
  isPartnerTyping: boolean;
  sendTyping: () => void;
}

export function useTypingStatus(): TypingStatusReturn {
  const { supabase, currentUser, partnerUser } = useAuthContext();
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    const channel = supabase.channel('typing:duo');
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.user_id === partnerUser.id) {
          setIsPartnerTyping(true);

          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Auto-clear after 3 seconds
          timeoutRef.current = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [supabase, partnerUser.id]);

  const sendTyping = useCallback(() => {
    const now = Date.now();
    // Throttle to 1 event per second
    if (now - lastSentRef.current < 1000) return;
    lastSentRef.current = now;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUser.id },
    });
  }, [currentUser.id]);

  return { isPartnerTyping, sendTyping };
}
