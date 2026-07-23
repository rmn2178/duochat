'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useTypingStatus } from '@/hooks/useTypingStatus';
import { useAIReplies } from '@/hooks/useAIReplies';
import { ReplyPreview } from './ReplyPreview';
import { AIReplyBar } from './AIReplyBar';
import { cn } from '@/lib/utils';
import type { Message, SendMessageRequest } from '@/types';

interface MessageInputProps {
  replyTo: Message | null;
  onCancelReply: () => void;
  currentUserId: string;
  partnerName: string;
  onSend: (req: SendMessageRequest, replyToId?: string) => Promise<Message | null>;
}

export function MessageInput({
  replyTo,
  onCancelReply,
  currentUserId,
  partnerName,
  onSend,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendTyping } = useTypingStatus();
  const { suggestions, loading: aiLoading, fetchSuggestions, clearSuggestions } = useAIReplies();
  const hasText = text.trim().length > 0;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    sendTyping();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = useCallback(async () => {
    if (!text.trim() || isSending) return;

    const msgText = text.trim();
    setText('');
    setIsSending(true);
    clearSuggestions();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const request: SendMessageRequest = {
      type: 'text',
      text: msgText,
    };

    try {
      await onSend(request, replyTo?.id);

      onCancelReply();
    } catch (err) {
      console.error('Send failed:', err);
      setText(msgText); // Restore text on failure
    } finally {
      setIsSending(false);
    }
  }, [text, isSending, replyTo, onCancelReply, clearSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Get signed upload URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          bucket: 'chat-images',
        }),
      });

      if (!uploadRes.ok) throw new Error('Failed to get upload URL');
      const { signedUrl, publicUrl } = await uploadRes.json();

      // Upload directly to Supabase Storage
      await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // Send image message
      await onSend({
        type: 'image',
        image_url: publicUrl,
      }, replyTo?.id);

      onCancelReply();
    } catch (err) {
      console.error('Image upload failed:', err);
    }

    // Reset input
    e.target.value = '';
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setText(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="safe-bottom border-t border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/70">
      {/* AI Reply Bar */}
      <AIReplyBar
        suggestions={suggestions}
        loading={aiLoading}
        onFetch={fetchSuggestions}
        onSelect={handleSuggestionSelect}
        onDismiss={clearSuggestions}
      />

      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
          <ReplyPreview
            message={replyTo}
            currentUserId={currentUserId}
            partnerName={partnerName}
            onCancel={onCancelReply}
          />
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="flex items-end gap-1 px-2 py-1.5">
        {/* Emoji + Attach */}
        <div className="flex shrink-0 items-center">
          <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ios-blue transition-colors hover:bg-black/5 dark:hover:bg-white/10">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </label>
        </div>

        {/* Text Input */}
        <div className="flex-1 rounded-[22px] bg-black/5 px-3 py-2 border border-black/5 dark:bg-white/10 dark:border-white/10">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            className="scrollbar-hide w-full resize-none bg-transparent text-[15px] leading-[20px] text-gray-900 outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40"
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Send / Mic Button */}
        <button
          onClick={handleSend}
          disabled={!hasText || isSending}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-120',
            hasText
              ? 'bg-ios-blue text-white hover:bg-ios-blue-active active:scale-95 shadow-sm'
              : 'text-ios-blue'
          )}
          aria-label={hasText ? 'Send message' : 'Record voice note'}
        >
          <AnimatePresence mode="wait">
            {hasText ? (
              <motion.svg
                key="send"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="mic"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
