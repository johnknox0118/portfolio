import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cyber_token')?.value;

  // Protect admin API routes and upload route
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/upload')) {
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }
    try {
      const payload = JSON.parse(base64urlDecode(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect admin dashboard pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    try {
      const payload = JSON.parse(base64urlDecode(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/upload/:path*'],
};
