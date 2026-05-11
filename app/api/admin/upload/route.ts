import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const authErr = await requireAdmin(request);
  if (authErr) return authErr;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) ?? 'uploads';

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${folder}/${uuidv4()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const db = getAdminClient();
  const { data, error } = await db.storage
    .from('medspa-assets')
    .upload(path, Buffer.from(buffer), {
      contentType: file.type,
      upsert: false,
    });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: urlData } = db.storage.from('medspa-assets').getPublicUrl(data.path);
  return Response.json({ url: urlData.publicUrl });
}
