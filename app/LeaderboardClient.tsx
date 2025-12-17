'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { formatCurrency, formatPercent, getTierInfo } from '@/lib/utils';
import type { ApprovedStats, User, Profile, Tier, Exchange } from '@prisma/client';

type LeaderboardEntry = ApprovedStats & {
  user: User & {
    profile: Profile | null;
  };
};

type Props = {
  initialData: {
    stats: LeaderboardEntry[];
    aggregates: {
      totalProfit: number;
      avgRoi: number;
      totalTraders: number;
    };
  };
};

export function LeaderboardClient({ initialData }: Props) {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<LeaderboardEntry[]>(initialData.stats);
  const [aggregates, setAggregates] = useState(initialData.aggregates);
  const [selectedWindow, setSelectedWindow] = useState('THIS_MONTH');
  const [selectedTier, setSelectedTier] = useState<Tier | 'ALL'>('ALL');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [hasApprovedStats, setHasApprovedStats] = useState(false);

  // Check if user has approved stats
  useEffect(() => {
    if (session?.user?.id) {
      const userInLeaderboard = stats.some(stat => stat.userId === session.user.id);
      setHasApprovedStats(userInLeaderboard);
    }
  }, [session, stats]);

  // Sticky bar scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch leaderboard data when filters change
  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams({
          window: selectedWindow,
          ...(selectedTier !== 'ALL' && { tier: selectedTier }),
        });

        const response = await fetch(`/api/leaderboard?${params}`);
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
          setAggregates(data.aggregates);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    }

    fetchData();
  }, [selectedWindow, selectedTier]);

  const handleCTAClick = () => {
    if (!session) {
      signIn('email');
    } else if (!session.user.username) {
      window.location.href = '/submit';
    } else if (!hasApprovedStats) {
      window.location.href = '/submit';
    }
  };

  const renderCTAButton = () => {
    if (status === 'loading') {
      return (
        <button className="cta-hyper h-11 px-7 text-sm font-bold text-white rounded-lg cursor-wait opacity-80 flex items-center gap-2.5">
          <svg className="animate-spin-slow w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </button>
      );
    }

    if (hasApprovedStats) {
      return (
        <div className="verified-state h-11 px-7 text-sm font-medium text-profit rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          <span>Verified Trader</span>
        </div>
      );
    }

    return (
      <button
        onClick={handleCTAClick}
        className="cta-hyper animate-btn-glow h-11 px-7 text-sm font-bold text-white rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <span>Get Naked & Ranked</span>
      </button>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-5">
      {/* Hero */}
      <div className="text-center mb-5">
        <h1 className="text-xl font-semibold mb-1">Verified Traders. Naked Returns.</h1>
        <p className="text-xs text-gray-400 mb-5">
          Public leaderboard of exchange-verified traders. No screenshots. No guesswork. Just naked PnL.
        </p>

        <div className="flex flex-col items-center gap-3 mb-3">
          {renderCTAButton()}
          <p className="text-[11px] text-gray-400">
            Join <span className="text-gray-300 font-medium">{aggregates.totalTraders}</span> verified traders tracking{' '}
            <span className="text-gray-300 font-medium">{formatCurrency(aggregates.totalProfit)}+</span> volume
          </p>
        </div>

        <a href="#leaderboard" className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
          View leaderboard ↓
        </a>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Monthly Reward Placeholder */}
        <div className="md:w-2/5 bg-white/[0.03] border border-white/10 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5"></div>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-900 to-amber-900 flex items-center justify-center text-2xl border border-whale/40 shadow-lg shadow-whale/20">
              🦁
            </div>
            <span className="absolute -top-1 -right-1 text-xs">👑</span>
          </div>
          <div className="relative min-w-0">
            <div className="text-[9px] text-whale font-semibold uppercase tracking-wide flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744z" clipRule="evenodd" />
              </svg>
              Monthly Reward
            </div>
            <p className="font-semibold text-sm truncate">Coming Soon</p>
            <p className="text-[8px] text-gray-500 mt-1">Top 3 traders earn exclusive rewards</p>
          </div>
        </div>

        {/* Stats Deck */}
        <div className="md:w-3/5 grid grid-cols-3 gap-2">
          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              Gross Profit
            </div>
            <p className="text-lg font-semibold font-mono tabular-nums text-profit">
              {formatCurrency(aggregates.totalProfit)}
            </p>
          </div>
          
          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
              Avg. ROI
            </div>
            <p className="text-lg font-semibold font-mono tabular-nums text-profit">
              {formatPercent(aggregates.avgRoi)}
            </p>
          </div>
          
          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Verified
            </div>
            <p className="text-lg font-semibold font-mono tabular-nums">{aggregates.totalTraders}</p>
          </div>
        </div>
      </div>

      {/* Continue in part 2... */}
      <LeaderboardTable
        stats={stats}
        selectedWindow={selectedWindow}
        selectedTier={selectedTier}
        onWindowChange={setSelectedWindow}
        onTierChange={setSelectedTier}
      />

      {/* Sticky Bottom CTA Bar */}
      {showStickyBar && !hasApprovedStats && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-0/95 backdrop-blur-md border-t border-border py-2.5 px-4 animate-slide-up">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-gray-400 hidden sm:block">Join {aggregates.totalTraders} verified traders</p>
              {status === 'authenticated' && !hasApprovedStats ? (
                <Link
                  href="/submit"
                  className="cta-hyper h-8 px-4 text-[11px] font-bold text-white rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>Get Naked & Ranked</span>
                </Link>
              ) : (
                <button
                  onClick={() => signIn('email')}
                  className="cta-hyper h-8 px-4 text-[11px] font-bold text-white rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>Get Naked & Ranked</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowStickyBar(false)}
              className="w-7 h-7 rounded-lg bg-surface-3 hover:bg-surface-4 flex items-center justify-center transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// Leaderboard Table Component (continued)
function LeaderboardTable({
  stats,
  selectedWindow,
  selectedTier,
  onWindowChange,
  onTierChange,
}: {
  stats: LeaderboardEntry[];
  selectedWindow: string;
  selectedTier: Tier | 'ALL';
  onWindowChange: (window: string) => void;
  onTierChange: (tier: Tier | 'ALL') => void;
}) {
  const windows = [
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'THREE_MONTHS', label: '3M' },
    { value: 'SIX_MONTHS', label: '6M' },
    { value: 'YTD', label: 'YTD' },
    { value: 'ALL_TIME', label: 'All-Time' },
  ];

  const tiers: Array<{ value: Tier | 'ALL'; emoji?: string; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'DOLPHIN' as Tier, emoji: '🐬', label: 'Dolphin' },
    { value: 'SHARK' as Tier, emoji: '🦈', label: 'Shark' },
    { value: 'WHALE' as Tier, emoji: '🐋', label: 'Whale' },
  ];

  return (
    <div id="leaderboard" className="bg-surface-1 border border-border rounded-xl overflow-hidden">
      {/* Filters */}
      <div className="px-3 py-2.5 border-b border-border flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {windows.map((window) => (
            <button
              key={window.value}
              onClick={() => onWindowChange(window.value)}
              className={`h-6 px-2.5 text-[10px] font-medium rounded transition-all ${
                selectedWindow === window.value
                  ? 'tab-active'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-border'
              }`}
            >
              {window.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-1.5">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.value;
            let buttonClass = '';
            
            if (isSelected) {
              buttonClass = 'bg-surface-3 text-gray-200';
            } else if (tier.value === 'ALL') {
              buttonClass = 'text-gray-400 hover:bg-surface-3 border border-transparent';
            } else if (tier.value === 'DOLPHIN') {
              buttonClass = 'text-dolphin hover:bg-dolphin/10 border border-dolphin/20';
            } else if (tier.value === 'SHARK') {
              buttonClass = 'text-shark hover:bg-shark/10 border border-shark/20';
            } else {
              buttonClass = 'text-whale hover:bg-whale/10 border border-whale/20';
            }

            return (
              <button
                key={tier.value}
                onClick={() => onTierChange(tier.value)}
                className={`h-6 px-2 text-[10px] font-medium rounded transition-all flex items-center gap-1 ${buttonClass}`}
              >
                {tier.emoji}
                <span className={!tier.emoji ? 'block' : 'hidden sm:block'}>{tier.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[9px] text-gray-500 uppercase tracking-wider border-b border-border">
              <th className="text-left py-2 px-3 font-medium w-12">Rank</th>
              <th className="text-left py-2 px-3 font-medium">Trader</th>
              <th className="text-left py-2 px-3 font-medium border-l border-border/50">Tier</th>
              <th className="text-right py-2 px-3 font-medium border-l border-border/50">Monthly PnL</th>
              <th className="text-right py-2 px-3 font-medium border-l border-border/50">Total PnL</th>
              <th className="text-right py-2 px-3 font-medium border-l border-border/50">Win Rate</th>
              <th className="text-center py-2 px-3 font-medium border-l border-border/50">Exchange</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => {
              const rank = index + 1;
              const profile = stat.user.profile;
              const tierInfo = getTierInfo(stat.tier);
              
              let rankDisplay;
              let rowClass = 'border-b border-border hover:bg-surface-3/20 cursor-pointer transition-colors group';
              
              if (rank === 1) {
                rankDisplay = <span className="text-lg">🥇</span>;
                rowClass = `row-gold gold-stripe ${rowClass}`;
              } else if (rank === 2) {
                rankDisplay = <span className="text-lg">🥈</span>;
                rowClass = `row-silver silver-stripe ${rowClass}`;
              } else if (rank === 3) {
                rankDisplay = <span className="text-lg">🥉</span>;
                rowClass = `row-bronze bronze-stripe ${rowClass}`;
              } else {
                rankDisplay = <span className="text-[12px] font-mono text-gray-500">{rank}</span>;
              }

              return (
                <tr key={stat.id} className={rowClass}>
                  <td className="py-2.5 px-3">{rankDisplay}</td>
                  <td className="py-2.5 px-3">
                    <Link href={`/trader/${profile?.username}`} className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-base">
                          {profile?.avatar || '👤'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-profit rounded-full border-2 border-surface-1"></span>
                      </div>
                      <div>
                        <div className="font-medium text-[13px]">{profile?.displayName}</div>
                        <span className="text-[10px] text-gray-500">@{profile?.username}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 border-l border-border/50">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium rounded ${tierInfo.textClass} ${tierInfo.bgClass} border ${tierInfo.borderClass}`}>
                      {tierInfo.emoji} {tierInfo.label} · {tierInfo.range}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 border-l border-border/50 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`font-mono tabular-nums font-medium ${stat.monthlyPnlPct >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercent(stat.monthlyPnlPct)}
                      </span>
                      <div className="w-14 h-1 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full animate-bar ${stat.monthlyPnlPct >= 0 ? 'bg-profit' : 'bg-loss'}`}
                          style={{ '--bar-w': `${Math.min(Math.abs(stat.monthlyPnlPct) * 4, 100)}%` } as React.CSSProperties}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 border-l border-border/50 text-right font-mono tabular-nums text-profit font-medium">
                    {formatCurrency(stat.totalPnlUsd)}
                  </td>
                  <td className="py-2.5 px-3 border-l border-border/50 text-right font-mono tabular-nums text-gray-300">
                    {stat.winRatePct}%
                  </td>
                  <td className="py-2.5 px-3 border-l border-border/50">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-profit rounded-full animate-pulse-live flex-shrink-0"></span>
                      <span className="text-[10px] text-gray-300">{stat.exchange}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-border">
        {stats.slice(0, 3).map((stat, index) => {
          const rank = index + 1;
          const profile = stat.user.profile;
          const tierInfo = getTierInfo(stat.tier);
          
          let rankEmoji = '';
          let cardClass = 'p-3';
          
          if (rank === 1) {
            rankEmoji = '🥇';
            cardClass = `p-3 row-gold gold-stripe`;
          } else if (rank === 2) {
            rankEmoji = '🥈';
            cardClass = `p-3 row-silver silver-stripe`;
          } else if (rank === 3) {
            rankEmoji = '🥉';
            cardClass = `p-3 row-bronze bronze-stripe`;
          }

          return (
            <div key={stat.id} className={cardClass}>
              <div className="flex items-center justify-between mb-2">
                <Link href={`/trader/${profile?.username}`} className="flex items-center gap-2">
                  <span className="text-lg">{rankEmoji}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl">
                    {profile?.avatar || '👤'}
                  </div>
                  <div>
                    <div className="font-medium text-[13px]">{profile?.displayName}</div>
                    <div className="text-[10px] text-gray-500">@{profile?.username}</div>
                  </div>
                </Link>
                <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${tierInfo.textClass} ${tierInfo.bgClass} border ${tierInfo.borderClass}`}>
                  {tierInfo.emoji} {tierInfo.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-gray-500">Monthly PnL</div>
                  <div className={`text-lg font-mono tabular-nums font-semibold ${stat.monthlyPnlPct >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatPercent(stat.monthlyPnlPct)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-profit rounded-full animate-pulse-live"></span>
                  <span className="text-[10px] text-gray-300">{stat.exchange}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Placeholder */}
      <div className="px-3 py-2 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-gray-500">1-{stats.length} of {stats.length}</span>
      </div>
    </div>
  );
}
