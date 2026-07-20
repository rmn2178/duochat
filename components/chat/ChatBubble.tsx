'use client';

import { motion } from 'framer-motion';
import { formatMessageTime, formatDuration, cn } from '@/lib/utils';
import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  isSelf: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onReply: (message: Message) => void;
  onLongPress: (message: Message, e: React.MouseEvent | React.TouchEvent) => void;
  replyToMessage?: Message | null;
}

function StatusTicks({ message }: { message: Message }) {
  const status = message._status;
  if (status === 'sending') return <span className="ml-1 text-[10px]">Sending...</span>;
  if (message.read_at) return <span className="ml-1 text-[10px] font-medium text-white/90">Read</span>;
  if (message.delivered_at) return <span className="ml-1 text-[10px] text-white/70">Delivered</span>;
  return <span className="ml-1 text-[10px] text-white/70">Sent</span>;
}

export function ChatBubble({
  message,
  isSelf,
  isFirstInGroup,
  isLastInGroup,
  onReply,
  onLongPress,
  replyToMessage,
}: ChatBubbleProps) {
  const isDeleted = message.deleted_for_everyone;
  const showTail = isLastInGroup;
  const time = formatMessageTime(message.created_at);

  // Swipe-to-reply gesture handler
  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 60) {
      onReply(message);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  // Long press handler
  let longPressTimer: NodeJS.Timeout | null = null;

  const handleTouchStart = (e: React.TouchEvent) => {
    longPressTimer = setTimeout(() => {
      onLongPress(message, e);
      if (navigator.vibrate) navigator.vibrate(15);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress(message, e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex px-[5%]',
        isSelf ? 'justify-end' : 'justify-start',
        isFirstInGroup ? 'mt-2' : 'mt-[2px]'
      )}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={handleContextMenu}
        className={cn(
          'relative max-w-[75%] px-[9px] pb-[6px] pt-[5px]',
          isSelf
            ? 'bg-gradient-to-t from-ios-blue to-[#4A90E2] text-white shadow-sm'
            : 'bg-white/60 backdrop-blur-md shadow-sm border border-white/40 dark:bg-black/40 dark:border-white/10 text-black dark:text-white',
          // Border radius
          'rounded-lg',
          // Tail on the last message of a group
          isSelf && showTail && 'bubble-tail-self rounded-br-none',
          !isSelf && showTail && 'bubble-tail-other rounded-bl-none',
        )}
      >
        {/* Reply preview inside bubble */}
        {replyToMessage && !isDeleted && (
          <div className={cn(
            'mb-1 cursor-pointer rounded-md border-l-[3px] px-2 py-1 text-[12px]',
            isSelf
              ? 'border-white/50 bg-white/20'
              : 'border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/10',
          )}>
            <p className={cn("font-medium", isSelf ? "text-white" : "text-black/80 dark:text-white/80")}>
              {replyToMessage.sender_id === (isSelf ? message.sender_id : message.receiver_id) ? 'You' : ''}
            </p>
            <p className={cn("line-clamp-1", isSelf ? "text-white/90" : "text-black/70 dark:text-white/70")}>
              {replyToMessage.deleted_for_everyone
                ? '🚫 This message was deleted'
                : replyToMessage.text || (replyToMessage.type === 'image' ? '📷 Photo' : '🎤 Voice message')}
            </p>
          </div>
        )}

        {/* Deleted message */}
        {isDeleted ? (
          <p className={cn("select-none italic text-[14.5px]", isSelf ? "text-white/80" : "text-black/50 dark:text-white/50")}>
            🚫 <span className="text-[13px]">This message was deleted</span>
          </p>
        ) : (
          <>
            {/* Image message */}
            {message.type === 'image' && message.image_url && (
              <div className="mb-1 overflow-hidden rounded-md">
                <img
                  src={message.image_url}
                  alt=""
                  className="max-h-[300px] w-full cursor-pointer object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Audio message */}
            {message.type === 'audio' && message.audio_url && (
              <div className="flex min-w-[200px] items-center gap-2 py-1">
                <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wa-green text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <div className="flex-1">
                  <div className="flex h-2 items-center gap-[2px]">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full w-[2px] rounded-full bg-wa-tick-grey/40"
                        style={{ height: `${Math.random() * 100}%`, minHeight: '2px' }}
                      />
                    ))}
                  </div>
                  <span className={cn("text-[11px]", isSelf ? "text-white/80" : "text-black/50 dark:text-white/50")}>
                    {message.audio_duration_ms ? formatDuration(message.audio_duration_ms) : '0:00'}
                  </span>
                </div>
              </div>
            )}

            {/* Text message */}
            {message.text && (
              <p className={cn(
                'whitespace-pre-wrap break-words text-[14.5px] leading-[19px]',
                isSelf
                  ? 'text-white'
                  : 'text-black dark:text-white'
              )}>
                {message.text}
              </p>
            )}
          </>
        )}

        {/* Timestamp + Ticks */}
        <span className={cn(
          'float-right ml-2 mt-[2px] flex items-center gap-0.5 text-[11px] leading-none',
          isSelf
            ? 'text-white/80'
            : 'text-black/50 dark:text-white/50'
        )}>
          {message.starred_by?.length > 0 && (
            <svg className="mr-0.5 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {time}
          {isSelf && <StatusTicks message={message} />}
        </span>

        {/* Reaction */}
        {message.reaction && !isDeleted && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute -bottom-3 rounded-full bg-white/80 backdrop-blur-md px-1.5 py-0.5 text-sm shadow-sm border border-white/40 dark:bg-black/60 dark:border-white/10',
              isSelf ? 'left-1' : 'right-1'
            )}
          >
            {message.reaction}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
