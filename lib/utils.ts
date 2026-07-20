import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Message } from '@/types';

/**
 * Merge Tailwind classes with clsx + tailwind-merge (shadcn pattern).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Group messages by calendar day for date dividers.
 */
export function groupMessagesByDay(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: Map<string, Message[]> = new Map();

  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(msg);
  }

  return Array.from(groups.entries()).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
}

/**
 * Format a date string for the date divider pill.
 * Returns "Today", "Yesterday", or the full date.
 */
export function formatDateDivider(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a relative time string for "last seen" display.
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 30) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp for display in a message bubble.
 */
export function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format audio duration in ms to MM:SS.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get the other user's ID (since there are only 2 users).
 */
export function getOtherUserId(currentUserId: string): string {
  const userAId = process.env.USER_A_ID || process.env.NEXT_PUBLIC_USER_A_ID || '';
  const userBId = process.env.USER_B_ID || process.env.NEXT_PUBLIC_USER_B_ID || '';
  return currentUserId === userAId ? userBId : userAId;
}

/**
 * Check if two messages should be visually grouped (same sender, within 1 minute).
 */
export function shouldGroupMessages(prev: Message, curr: Message): boolean {
  if (prev.sender_id !== curr.sender_id) return false;
  const prevTime = new Date(prev.created_at).getTime();
  const currTime = new Date(curr.created_at).getTime();
  return Math.abs(currTime - prevTime) < 60 * 1000; // 1 minute
}
