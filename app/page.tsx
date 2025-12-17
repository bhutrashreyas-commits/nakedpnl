import { Navbar } from '@/components/Navbar';
import { LeaderboardClient } from './LeaderboardClient';
import { prisma } from '@/lib/prisma';
import { TimeWindow } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function getInitialLeaderboardData() {
  const stats = await prisma.approvedStats.findMany({
    where: {
      window: TimeWindow.THIS_MONTH,
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: [
      { monthlyPnlPct: 'desc' },
      { totalPnlUsd: 'desc' },
    ],
    take: 10,
  });

  const aggregates = await prisma.approvedStats.aggregate({
    where: { window: TimeWindow.THIS_MONTH },
    _sum: {
      totalPnlUsd: true,
    },
    _avg: {
      monthlyPnlPct: true,
    },
    _count: true,
  });

  return {
    stats,
    aggregates: {
      totalProfit: aggregates._sum.totalPnlUsd || 0,
      avgRoi: aggregates._avg.monthlyPnlPct || 0,
      totalTraders: aggregates._count,
    },
  };
}

export default async function Home() {
  const initialData = await getInitialLeaderboardData();

  return (
    <div className="min-h-screen">
      <Navbar />
      <LeaderboardClient initialData={initialData} />
      
      {/* Footer */}
      <footer className="border-t border-border mt-5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-gray-500">© 2025 NakedPnL</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-gray-500 hover:text-gray-300">
              Methodology
            </a>
            <a href="#" className="text-[10px] text-gray-500 hover:text-gray-300">
              Terms
            </a>
            <a href="#" className="text-[10px] text-gray-500 hover:text-gray-300">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
