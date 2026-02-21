import { NextRequest, NextResponse } from 'next/server';

// Middleware runs on Edge Runtime by default in Next.js — warm instances
// keep the in-memory rate limiter state alive between requests.

// In-memory sliding window rate limiter (per-instance, resets on cold start)
const CHAT_WINDOW_MS = 60_000; // 1 minute
const CHAT_MAX_REQUESTS = 20;
const chatRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = chatRequests.get(ip) ?? [];

  // Evict expired entries
  const valid = timestamps.filter((t) => now - t < CHAT_WINDOW_MS);

  if (valid.length >= CHAT_MAX_REQUESTS) {
    chatRequests.set(ip, valid);
    return true;
  }

  valid.push(now);
  chatRequests.set(ip, valid);
  return false;
}

export function middleware(request: NextRequest) {
  const start = Date.now();
  const { pathname } = request.nextUrl;

  // Rate limit chat route
  if (pathname === '/api/chat') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another message.' },
        { status: 429 },
      );
    }
  }

  // Request logging for all API routes
  const response = NextResponse.next();
  const duration = Date.now() - start;
  console.log(`[API] ${request.method} ${pathname} (${duration}ms)`);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
