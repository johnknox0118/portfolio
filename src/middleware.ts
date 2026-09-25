import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'cybersecurity_portfolio_secret_key_2026_jwt';

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * Cryptographically verify HMAC-SHA256 signature and expiration in Edge Runtime
 */
async function verifyJwtEdge(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [headerB64, payloadB64, signatureB64] = parts;

  // 1. Expiration validation
  try {
    const payload = JSON.parse(base64urlDecode(payloadB64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
  } catch {
    return false;
  }

  // 2. Cryptographic HMAC-SHA256 verification
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    let sigBase64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (sigBase64.length % 4) sigBase64 += '=';
    const binarySig = atob(sigBase64);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    return await crypto.subtle.verify('HMAC', key, sigBytes, data);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('cyber_token')?.value;

  // Protect admin API routes and upload route
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/upload')) {
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const isValid = await verifyJwtEdge(token, JWT_SECRET);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect admin dashboard pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const isValid = await verifyJwtEdge(token, JWT_SECRET);
    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/upload/:path*'],
};
