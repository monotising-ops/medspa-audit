import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url || !url.startsWith('https://')) {
    return new Response('Invalid URL', { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch {
    return new Response('Failed to fetch PDF', { status: 502 });
  }

  if (!res.ok) return new Response('Upstream error', { status: 502 });

  const buffer = await res.arrayBuffer();
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
