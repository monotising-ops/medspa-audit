import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme';

export async function requireAdmin(request: NextRequest): Promise<Response | null> {
  const token = request.headers.get('x-admin-token');
  if (token === ADMIN_PASSWORD) return null;

  // Also accept from cookie (set during admin login)
  const cookieToken = request.cookies.get('admin_token')?.value;
  if (cookieToken === ADMIN_PASSWORD) return null;

  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
