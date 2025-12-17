import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TimeWindow, Tier } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query params with defaults
    const window = (searchParams.get('window') as TimeWindow) || TimeWindow.THIS_MONTH;
    const tier = searchParams.get('tier') as Tier | null;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Build where clause
    const where: any = {
      window,
    };
    
    if (tier) {
      where.tier = tier;
    }
    
    // If search is provided, join with profile
    const include = {
      user: {
        include: {
          profile: true,
        },
      },
    };
    
    // Get total count
    const total = await prisma.approvedStats.count({ where });
    
    // Get paginated results with deterministic sorting
    const stats = await prisma.approvedStats.findMany({
      where,
      include,
      orderBy: [
        { monthlyPnlPct: 'desc' },
        { totalPnlUsd: 'desc' },
        { createdAt: 'asc' },  // Tie-breaker for consistent ranking
      ],
      skip: (page - 1) * limit,
      take: limit,
    });
    
    // Calculate aggregate stats
    const aggregates = await prisma.approvedStats.aggregate({
      where: { window },
      _sum: {
        totalPnlUsd: true,
      },
      _avg: {
        monthlyPnlPct: true,
      },
      _count: true,
    });
    
    return NextResponse.json({
      success: true,
      data: stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      aggregates: {
        totalProfit: aggregates._sum.totalPnlUsd || 0,
        avgRoi: aggregates._avg.monthlyPnlPct || 0,
        totalTraders: aggregates._count,
      },
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
