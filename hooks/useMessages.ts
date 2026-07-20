'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Message, SendMessageRequest } from '@/types';

interface UseMessagesReturn {
  messages: Message[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendMessage: (request: SendMessageRequest, replyToId?: string) => Promise<Message | null>;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useMessages(initialMessages: Message[]): UseMessagesReturn {
  const { currentUser } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length >= 40);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || messages.length === 0) return;
    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const oldestMessage = messages[0];
      const cursor = oldestMessage.created_at;
      const res = await fetch(`/api/messages?cursor=${encodeURIComponent(cursor)}&limit=40`);
      const data = await res.json();

      if (data.messages?.length > 0) {
        setMessages((prev) => [...data.messages.reverse(), ...prev]);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [hasMore, messages]);

  const sendMessage = useCallback(
    async (request: SendMessageRequest, replyToId?: string): Promise<Message | null> => {
      // Create optimistic message
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        sender_id: currentUser.id,
        receiver_id: '', // Will be set by server
        type: request.type || 'text',
        text: request.text || null,
        image_url: request.image_url || null,
        audio_url: request.audio_url || null,
        audio_duration_ms: request.audio_duration_ms || null,
        reply_to_id: replyToId || null,
        reaction: null,
        starred_by: [],
        deleted_for_everyone: false,
        deleted_for: [],
        delivered_at: null,
        read_at: null,
        created_at: new Date().toISOString(),
        _status: 'sending',
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...request, reply_to_id: replyToId }),
        });

        if (!res.ok) throw new Error('Failed to send');

        const data = await res.json();
        const serverMessage = { ...data.message, _status: 'sent' as const };

        // Replace optimistic message with server response
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? serverMessage : m))
        );

        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }

        return serverMessage;
      } catch (error) {
        console.error('Failed to send message:', error);
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        return null;
      }
    },
    [currentUser.id]
  );

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  return {
    messages,
    isLoadingMore,
    hasMore,
    loadMore,
    sendMessage,
    addMessage,
    updateMessage,
    setMessages,
  };
}
