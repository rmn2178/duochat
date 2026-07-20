import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createServiceRoleSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { filename, contentType, bucket } = body;

  if (!filename || !contentType || !bucket) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['chat-images', 'chat-audio'].includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  const supabase = createServiceRoleSupabase();
  const fileId = crypto.randomUUID();
  const ext = filename.split('.').pop() || '';
  const path = `${user.id}/${fileId}${ext ? '.' + ext : ''}`;

  // Create a signed upload URL
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    console.error('Upload URL error:', error);
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    publicUrl: publicUrlData.publicUrl,
    path,
  });
}
