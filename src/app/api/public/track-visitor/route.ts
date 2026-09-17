import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface GeoData {
  status: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  isp?: string;
  org?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
}

// In-memory cache for IP geolocation to minimize external API requests
const geoCache = new Map<string, { data: GeoData; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to determine if an IP is a local/private loopback
function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim().replace(/^::ffff:/, '');
  return (
    clean === '::1' ||
    clean === '127.0.0.1' ||
    clean === 'localhost' ||
    clean.startsWith('192.168.') ||
    clean.startsWith('10.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.20.') ||
    clean.startsWith('172.21.') ||
    clean.startsWith('172.22.') ||
    clean.startsWith('172.23.') ||
    clean.startsWith('172.24.') ||
    clean.startsWith('172.25.') ||
    clean.startsWith('172.26.') ||
    clean.startsWith('172.27.') ||
    clean.startsWith('172.28.') ||
    clean.startsWith('172.29.') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.')
  );
}

// Helper to parse device, OS, and browser from userAgent
function parseUserAgent(ua: string) {
  let device = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  if (!ua) return { device, os, browser };

  // Device
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) {
    device = 'Tablet';
  } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    device = 'Mobile';
  }

  // OS
  if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'Chrome OS';

  // Browser
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Chromium|Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';

  return { device, os, browser };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { page = '/', referer = '' } = body;

    // Only exclude internal dashboard views (/admin/dashboard), but allow tracking /admin/login and all portfolio pages
    if (typeof page === 'string' && page.startsWith('/admin/dashboard')) {
      return NextResponse.json({ skipped: true, reason: 'admin_dashboard_internal' });
    }

    // 1. Extract IP Address from standard request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    let rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-client-ip') ||
      ''
    );

    // Clean IPv6 mapped IPv4 address (e.g. ::ffff:192.168.1.1)
    rawIp = rawIp.replace(/^::ffff:/, '');

    const isLocal = isPrivateOrLocalIp(rawIp);
    let lookupIp = rawIp;
    let isLocalhostFlag = false;

    // If request is from localhost / development, resolve server host's public WAN IP
    // so real location data is shown on localhost!
    if (isLocal) {
      isLocalhostFlag = true;
      try {
        const ipifyRes = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(2000),
        });
        if (ipifyRes.ok) {
          const ipifyData = await ipifyRes.json();
          if (ipifyData?.ip) {
            lookupIp = ipifyData.ip;
          }
        }
      } catch {
        // Keep as local if offline
      }
    }

    // 2. Resolve Geolocation (Check edge headers from Vercel/Cloudflare first)
    const vercelCity = request.headers.get('x-vercel-ip-city');
    const vercelCountryCode = request.headers.get('x-vercel-ip-country');
    const vercelRegion = request.headers.get('x-vercel-ip-country-region');
    const vercelLat = request.headers.get('x-vercel-ip-latitude');
    const vercelLon = request.headers.get('x-vercel-ip-longitude');
    const vercelPostal = request.headers.get('x-vercel-ip-postal-code');

    let geo: GeoData | null = null;

    if (lookupIp && !isPrivateOrLocalIp(lookupIp)) {
      // Check cache
      const cached = geoCache.get(lookupIp);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        geo = cached.data;
      } else {
        try {
          const geoRes = await fetch(
            `http://ip-api.com/json/${lookupIp}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,mobile,proxy,hosting`,
            { signal: AbortSignal.timeout(3000) }
          );
          if (geoRes.ok) {
            const data: GeoData = await geoRes.json();
            if (data.status === 'success') {
              geo = data;
              geoCache.set(lookupIp, { data, timestamp: Date.now() });
            }
          }
        } catch (err) {
          console.warn('Geo lookup warning:', err);
        }
      }
    }

    // Decode Vercel headers if present
    const decodedCity = vercelCity ? decodeURIComponent(vercelCity) : '';
    const decodedRegion = vercelRegion ? decodeURIComponent(vercelRegion) : '';

    // Determine precision rating
    let accuracyRating = 'District / Regional (~15-20km)';
    if (geo?.zip || vercelPostal) {
      accuracyRating = 'City / District Level (~5-10km)';
    } else if (geo?.mobile) {
      accuracyRating = 'Cellular Tower / Circle (~10-25km)';
    } else if (isLocalhostFlag) {
      accuracyRating = 'City / District Level (Host WAN ~5-10km)';
    }

    const ua = request.headers.get('user-agent') || '';
    const { device, os, browser } = parseUserAgent(ua);

    const country = geo?.country || (vercelCountryCode ? vercelCountryCode : (isLocalhostFlag ? 'Localhost (Dev)' : 'Unknown'));
    const countryCode = geo?.countryCode || vercelCountryCode || (isLocalhostFlag ? 'DEV' : '');
    const region = geo?.regionName || decodedRegion || (isLocalhostFlag ? 'Local Network' : '');
    const city = geo?.city || decodedCity || (isLocalhostFlag ? 'Local Machine' : '');
    const postalCode = geo?.zip || vercelPostal || '';
    const latitude = geo?.lat ?? (vercelLat ? parseFloat(vercelLat) : null);
    const longitude = geo?.lon ?? (vercelLon ? parseFloat(vercelLon) : null);
    const isp = geo?.isp || (isLocalhostFlag ? 'Local Loopback' : 'Public Internet Carrier');
    const org = geo?.org || '';
    const isVpn = Boolean(geo?.proxy || geo?.hosting);

    // 3. Session De-duplication:
    // If the same IP visited the exact same page within the last 45 seconds, update the record rather than flooding the table
    const targetPage = typeof page === 'string' ? page.substring(0, 100) : '/';
    const fortyFiveSecondsAgo = new Date(Date.now() - 45 * 1000);
    const existingLog = await prisma.visitorLog.findFirst({
      where: {
        ipAddress: lookupIp || rawIp || '127.0.0.1',
        page: targetPage,
        updatedAt: { gte: fortyFiveSecondsAgo },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (existingLog) {
      await prisma.visitorLog.update({
        where: { id: existingLog.id },
        data: {
          visitCount: existingLog.visitCount + 1,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, updated: true, id: existingLog.id });
    }

    // 4. Create new visitor log
    const newLog = await prisma.visitorLog.create({
      data: {
        ipAddress: lookupIp || rawIp || '127.0.0.1',
        country,
        countryCode,
        region,
        city,
        postalCode,
        latitude,
        longitude,
        isp,
        org,
        userAgent: ua.substring(0, 300),
        device,
        os,
        browser,
        page: typeof page === 'string' ? page.substring(0, 100) : '/',
        referer: typeof referer === 'string' ? referer.substring(0, 200) : '',
        accuracy: accuracyRating,
        isVpn,
        isLocalhost: isLocalhostFlag,
        visitCount: 1,
      },
    });

    return NextResponse.json({ success: true, id: newLog.id }, { status: 201 });
  } catch (error: any) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
  }
}
