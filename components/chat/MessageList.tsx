'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { ChatBubble } from './ChatBubble';
import { DateDivider } from './DateDivider';
import { ScrollToBottomButton } from './ScrollToBottomButton';
import { MessageContextMenu } from './MessageContextMenu';
import { ReactionPicker } from './ReactionPicker';
import { groupMessagesByDay, shouldGroupMessages } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageListProps {
  initialMessages: Message[];
  currentUserId: string;
  partnerName: string;
  onReply: (message: Message) => void;
}

export function MessageList({
  initialMessages,
  currentUserId,
  partnerName,
  onReply,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    message: Message;
    x: number;
    y: number;
  } | null>(null);
  const [reactionPickerMsg, setReactionPickerMsg] = useState<Message | null>(null);
  const isAtBottomRef = useRef(true);

  const {
    messages,
    isLoadingMore,
    hasMore,
    loadMore,
    addMessage,
    updateMessage,
  } = useMessages(initialMessages);

  // Build a map for reply lookups
  const messageMap = new Map(messages.map((m) => [m.id, m]));

  // Realtime subscription
  useRealtimeMessages({
    currentUserId,
    onInsert: useCallback(
      (message: Message) => {
        addMessage(message);
        if (!isAtBottomRef.current) {
          setUnreadCount((prev) => prev + 1);
        }
      },
      [addMessage]
    ),
    onUpdate: useCallback(
      (message: Message) => {
        updateMessage(message.id, message);
      },
      [updateMessage]
    ),
  });

  // Scroll to bottom on initial load and new messages (if already at bottom)
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages.length]);

  // Initial scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 100;
    isAtBottomRef.current = atBottom;
    setShowScrollButton(!atBottom);

    if (atBottom) {
      setUnreadCount(0);
    }

    // Load more when scrolling near the top
    if (el.scrollTop < 200 && hasMore && !isLoadingMore) {
      const prevScrollHeight = el.scrollHeight;
      loadMore().then(() => {
        // Preserve scroll position after prepending messages
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop =
              scrollRef.current.scrollHeight - prevScrollHeight;
          }
        });
      });
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadCount(0);
  }, []);

  const handleLongPress = useCallback(
    (message: Message, e: React.MouseEvent | React.TouchEvent) => {
      let x: number, y: number;
      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        x = touch?.clientX || 0;
        y = touch?.clientY || 0;
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      setContextMenu({ message, x, y });
    },
    []
  );

  const handleContextAction = useCallback(
    async (action: string, message: Message) => {
      setContextMenu(null);

      switch (action) {
        case 'reply':
          onReply(message);
          break;
        case 'react':
          setReactionPickerMsg(message);
          break;
        case 'copy':
          if (message.text) {
            await navigator.clipboard.writeText(message.text);
          }
          break;
        case 'star':
          await fetch(`/api/messages/${message.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: message.starred_by?.includes(currentUserId) ? 'unstar' : 'star',
            }),
          });
          break;
        case 'deleteForMe':
          await fetch(`/api/messages/${message.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteForMe' }),
          });
          break;
        case 'deleteForEveryone':
          await fetch(`/api/messages/${message.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteForEveryone' }),
          });
          break;
      }
    },
    [currentUserId, onReply]
  );

  const handleReaction = useCallback(
    async (emoji: string) => {
      if (!reactionPickerMsg) return;
      await fetch(`/api/messages/${reactionPickerMsg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: reactionPickerMsg.reaction === emoji ? 'unreact' : 'react',
          emoji,
        }),
      });
      setReactionPickerMsg(null);
    },
    [reactionPickerMsg]
  );

  const dayGroups = groupMessagesByDay(
    messages.filter((m) => !m.deleted_for?.includes(currentUserId))
  );

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-hide h-full overflow-y-auto pb-2 ios-glass-bg"
      >
        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-ios-blue dark:border-white/20 dark:border-t-ios-blue" />
          </div>
        )}

        {/* Messages grouped by day */}
        {dayGroups.map((group) => (
          <div key={group.date}>
            <DateDivider date={group.messages[0].created_at} />
            {group.messages.map((message, idx) => {
              const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
              const nextMsg = idx < group.messages.length - 1 ? group.messages[idx + 1] : null;

              const isGroupedWithPrev = prevMsg ? shouldGroupMessages(prevMsg, message) : false;
              const isGroupedWithNext = nextMsg ? shouldGroupMessages(message, nextMsg) : false;

              const isFirstInGroup = !isGroupedWithPrev;
              const isLastInGroup = !isGroupedWithNext;

              return (
                <ChatBubble
                  key={message.id}
                  message={message}
                  isSelf={message.sender_id === currentUserId}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  onReply={onReply}
                  onLongPress={handleLongPress}
                  replyToMessage={
                    message.reply_to_id ? messageMap.get(message.reply_to_id) || null : null
                  }
                />
              );
            })}
          </div>
        ))}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-2xl bg-white/50 px-6 py-4 text-center shadow-lg backdrop-blur-md border border-white/40 dark:bg-black/40 dark:border-white/10">
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                No messages yet. Say hi to {partnerName}! 👋
              </p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <ScrollToBottomButton onClick={scrollToBottom} unreadCount={unreadCount} />
      )}

      {/* Context menu */}
      {contextMenu && (() => {
        const message = contextMenu.message;
        const isSelf = message.sender_id === currentUserId;
        const isWithin1Hour =
          new Date().getTime() - new Date(message.created_at).getTime() < 3600000;
        const isStarred = message.starred_by?.includes(currentUserId);

        const actions = [
          { label: 'Reply', icon: '↩️', onClick: () => handleContextAction('reply', message) },
          { label: 'React', icon: '❤️', onClick: () => handleContextAction('react', message) },
          ...(message.text ? [{ label: 'Copy', icon: '📋', onClick: () => handleContextAction('copy', message) }] : []),
          { label: isStarred ? 'Unstar' : 'Star', icon: '⭐️', onClick: () => handleContextAction('star', message) },
          { label: 'Delete for me', icon: '🗑️', danger: true, onClick: () => handleContextAction('deleteForMe', message) },
          ...(isSelf && isWithin1Hour ? [{ label: 'Delete for everyone', icon: '🚫', danger: true, onClick: () => handleContextAction('deleteForEveryone', message) }] : []),
        ];

        return (
          <MessageContextMenu
            message={message}
            x={contextMenu.x}
            y={contextMenu.y}
            actions={actions}
            onClose={() => setContextMenu(null)}
          />
        );
      })()}

      {/* Reaction picker */}
      {reactionPickerMsg && (
        <ReactionPicker
          onSelect={handleReaction}
          onClose={() => setReactionPickerMsg(null)}
          currentReaction={reactionPickerMsg.reaction || undefined}
        />
      )}
    </div>
  );
}
