import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const fd = await request.formData();
  const file = fd.get('file') as File | null;
  const clientId = fd.get('clientId') as string | null;
  const category = fd.get('category') as string | null;

  if (!file || !clientId || !category)
    return Response.json({ error: 'Missing file, clientId, or category' }, { status: 400 });

  if (file.size > MAX_BYTES)
    return Response.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });

  const db = getAdminClient();

  // Verify client exists
  const { data: client } = await db
    .from('client_onboarding')
    .select('client_id')
    .eq('client_id', clientId)
    .maybeSingle();
  if (!client)
    return Response.json({ error: 'Invalid client ID' }, { status: 403 });

  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `onboarding/${clientId}/${category}/${uuidv4()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { data, error } = await db.storage
    .from('onboarding-assets')
    .upload(path, Buffer.from(buffer), { contentType: file.type, upsert: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: urlData } = db.storage.from('onboarding-assets').getPublicUrl(data.path);
  return Response.json({ url: urlData.publicUrl, name: file.name, path: data.path });
}

export async function DELETE(request: NextRequest) {
  const { clientId, path } = await request.json();
  if (!clientId || !path)
    return Response.json({ error: 'Missing clientId or path' }, { status: 400 });

  if (!path.startsWith(`onboarding/${clientId}/`))
    return Response.json({ error: 'Forbidden' }, { status: 403 });

  const db = getAdminClient();
  const { error } = await db.storage.from('onboarding-assets').remove([path]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
