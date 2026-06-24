import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url || !url.startsWith('https://')) {
    return new Response('Invalid URL', { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return new Response('Failed to fetch PDF', { status: 502 });
  }

  if (!res.ok) return new Response('Upstream error', { status: 502 });

  // Stream the body directly — avoids buffering the entire file in memory
  return new Response(res.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="document.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
