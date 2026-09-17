import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const deviceFilter = searchParams.get('device') || 'all';
    const timeframe = searchParams.get('timeframe') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '150', 10), 500);

    // Build Prisma where filter
    const where: any = {};

    if (deviceFilter !== 'all') {
      where.device = { equals: deviceFilter, mode: 'insensitive' };
    }

    if (timeframe === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfToday };
    } else if (timeframe === '24h') {
      where.createdAt = { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    } else if (timeframe === '7d') {
      where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    if (search) {
      where.OR = [
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { postalCode: { contains: search, mode: 'insensitive' } },
        { isp: { contains: search, mode: 'insensitive' } },
        { org: { contains: search, mode: 'insensitive' } },
        { os: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
        { page: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, totalVisits, tenMinutesAgo] = await Promise.all([
      prisma.visitorLog.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
      }),
      prisma.visitorLog.count(),
      new Date(Date.now() - 10 * 60 * 1000),
    ]);

    // Active in last 10 minutes
    const activeNowCount = await prisma.visitorLog.count({
      where: { updatedAt: { gte: tenMinutesAgo } },
    });

    // Unique IPs
    const distinctIps = await prisma.visitorLog.findMany({
      select: { ipAddress: true },
      distinct: ['ipAddress'],
    });

    // Aggregate stats from the fetched records
    let totalPageViews = 0;
    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };

    for (const log of logs) {
      totalPageViews += log.visitCount || 1;
      const c = log.country || 'Unknown';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
      if (log.device in deviceCounts) {
        deviceCounts[log.device]++;
      } else {
        deviceCounts.Desktop++;
      }
    }

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    return NextResponse.json({
      logs,
      stats: {
        totalVisits,
        totalPageViews,
        uniqueIps: distinctIps.length,
        activeNow: activeNowCount,
        topCountries,
        deviceCounts,
      },
    });
  } catch (error: any) {
    console.error('Error fetching visitor logs:', error);
    return NextResponse.json({ error: 'Failed to retrieve visitor logs' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, id } = body;

    if (action === 'clear_all') {
      const deleteResult = await prisma.visitorLog.deleteMany({});
      return NextResponse.json({ success: true, message: 'All visitor logs cleared', count: deleteResult.count });
    }

    if (id) {
      await prisma.visitorLog.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json({ success: true, message: 'Visitor log deleted' });
    }

    return NextResponse.json({ error: 'Invalid delete request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error deleting visitor log:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
