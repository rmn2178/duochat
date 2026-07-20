import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser, getSessionToken } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';

const DELETE_FOR_EVERYONE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * PATCH /api/messages/[id] — Update a message
 * Actions: delivered, read, react, unreact, deleteForMe, deleteForEveryone, star, unstar
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerSupabase(token);
  const body = await request.json();
  const { action } = body;

  // Fetch the message first
  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  // Ensure the user is a party to this message
  if (message.sender_id !== user.id && message.receiver_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let updateData: Record<string, unknown> = {};

  switch (action) {
    case 'delivered':
      // Only the receiver can mark as delivered
      if (message.receiver_id !== user.id) {
        return NextResponse.json({ error: 'Only the receiver can mark as delivered' }, { status: 403 });
      }
      if (!message.delivered_at) {
        updateData = { delivered_at: new Date().toISOString() };
      }
      break;

    case 'read':
      // Only the receiver can mark as read
      if (message.receiver_id !== user.id) {
        return NextResponse.json({ error: 'Only the receiver can mark as read' }, { status: 403 });
      }
      updateData = {
        delivered_at: message.delivered_at || new Date().toISOString(),
        read_at: new Date().toISOString(),
      };
      break;

    case 'react':
      if (!body.emoji) {
        return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
      }
      updateData = { reaction: body.emoji };
      break;

    case 'unreact':
      updateData = { reaction: null };
      break;

    case 'deleteForMe':
      updateData = {
        deleted_for: [...(message.deleted_for || []), user.id],
      };
      break;

    case 'deleteForEveryone':
      // Only the sender can delete for everyone
      if (message.sender_id !== user.id) {
        return NextResponse.json(
          { error: 'Only the sender can delete for everyone' },
          { status: 403 }
        );
      }
      // Check time window
      const messageAge = Date.now() - new Date(message.created_at).getTime();
      if (messageAge > DELETE_FOR_EVERYONE_WINDOW_MS) {
        return NextResponse.json(
          { error: 'Cannot delete for everyone after 1 hour' },
          { status: 403 }
        );
      }
      updateData = { deleted_for_everyone: true };
      break;

    case 'star':
      updateData = {
        starred_by: [...(message.starred_by || []).filter((uid: string) => uid !== user.id), user.id],
      };
      break;

    case 'unstar':
      updateData = {
        starred_by: (message.starred_by || []).filter((uid: string) => uid !== user.id),
      };
      break;

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message });
  }

  const { data: updated, error: updateError } = await supabase
    .from('messages')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating message:', updateError);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }

  return NextResponse.json({ message: updated });
}
