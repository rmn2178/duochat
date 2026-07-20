'use client';

import { motion } from 'framer-motion';
import type { Message } from '@/types';

interface ReplyPreviewProps {
  message: Message;
  currentUserId: string;
  partnerName: string;
  onCancel: () => void;
}

export function ReplyPreview({
  message,
  currentUserId,
  partnerName,
  onCancel,
}: ReplyPreviewProps) {
  const isOwnMessage = message.sender_id === currentUserId;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden border-t border-wa-divider dark:border-transparent"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex-1 rounded-md border-l-[3px] border-wa-teal bg-white/70 px-3 py-1.5 dark:border-wa-green dark:bg-wa-bubble-other-dark/70">
          <p className="text-[12px] font-semibold text-wa-teal dark:text-wa-green">
            {isOwnMessage ? 'You' : partnerName}
          </p>
          <p className="line-clamp-1 text-[13px] text-wa-tick-grey">
            {message.deleted_for_everyone
              ? '🚫 This message was deleted'
              : message.text ||
                (message.type === 'image' ? '📷 Photo' : '🎤 Voice message')}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-wa-tick-grey transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Cancel reply"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
