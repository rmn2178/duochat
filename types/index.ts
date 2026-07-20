// ── User ──────────────────────────────────────────────────────────
export interface User {
  id: string;
  phone_number: string;
  name: string;
  avatar_url: string | null;
  last_seen_at: string | null;
  created_at: string;
}

// ── Message ───────────────────────────────────────────────────────
export type MessageType = 'text' | 'image' | 'audio';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  type: MessageType;
  text: string | null;
  image_url: string | null;
  audio_url: string | null;
  audio_duration_ms: number | null;
  reply_to_id: string | null;
  reaction: string | null;
  starred_by: string[];
  deleted_for_everyone: boolean;
  deleted_for: string[];
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  // Client-side only fields
  _status?: MessageStatus;
  _replyToMessage?: Message | null;
}

// ── API Request/Response Types ────────────────────────────────────
export interface LoginRequest {
  phone: string;
  code: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
}

export interface SendMessageRequest {
  type: MessageType;
  text?: string;
  image_url?: string;
  audio_url?: string;
  audio_duration_ms?: number;
  reply_to_id?: string;
}

export type MessageAction =
  | { action: 'delivered' }
  | { action: 'read' }
  | { action: 'react'; emoji: string }
  | { action: 'unreact' }
  | { action: 'deleteForMe' }
  | { action: 'deleteForEveryone' }
  | { action: 'star' }
  | { action: 'unstar' };

export interface AISuggestion {
  suggestions: string[];
}

// ── Session ───────────────────────────────────────────────────────
export interface SessionUser {
  id: string;
  name: string;
}

// ── Upload ────────────────────────────────────────────────────────
export interface UploadRequest {
  filename: string;
  contentType: string;
  bucket: 'chat-images' | 'chat-audio';
}

export interface UploadResponse {
  signedUrl: string;
  publicUrl: string;
  path: string;
}
