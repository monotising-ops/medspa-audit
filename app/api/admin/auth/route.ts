import { NextRequest } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (!verifyAdminPassword(password)) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }
  const response = Response.json({ ok: true });
  // Set secure cookie
  response.headers.set(
    'Set-Cookie',
    `admin_token=${process.env.ADMIN_PASSWORD ?? 'changeme'}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
  );
  return response;
}

export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.set(
    'Set-Cookie',
    'admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
  );
  return response;
}
