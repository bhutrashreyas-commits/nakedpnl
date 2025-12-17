import { Navbar } from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatPercent, getTierInfo } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

type Props = {
  params: {
    username: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const profile = await prisma.profile.findUnique({
    where: { username: params.username },
  });

  if (!profile) {
    return {
      title: 'Trader Not Found',
    };
  }

  return {
    title: `${profile.displayName} (@${profile.username}) - NakedPnL`,
    description: `View ${profile.displayName}'s verified trading performance on NakedPnL`,
  };
}

export default async function TraderPage({ params }: Props) {
  const profile = await prisma.profile.findUnique({
    where: { username: params.username },
    include: {
      user: {
        include: {
          approvedStats: {
            orderBy: { updatedAt: 'desc' },
          },
          submissions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === profile.userId;

  const currentStats = profile.user.approvedStats[0];
  const hasPendingSubmission = profile.user.submissions.some(
    (sub) => sub.status === 'PENDING'
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Profile Header */}
        <div className="bg-surface-1 border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-4xl">
                {profile.avatar || '👤'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                <p className="text-gray-400">@{profile.username}</p>
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand hover:underline"
                  >
                    Twitter
                  </a>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                {!currentStats && !hasPendingSubmission && (
                  <Link
                    href="/submit"
                    className="h-9 px-4 text-sm font-medium bg-brand hover:bg-brand/80 text-white rounded-lg transition-colors"
                  >
                    Submit Stats
                  </Link>
                )}
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-300 mb-4">{profile.bio}</p>
          )}

          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentStats && (
              <span className="verified-state px-3 py-1.5 text-xs font-medium text-profit rounded-lg flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified Trader
              </span>
            )}
            {hasPendingSubmission && (
              <span className="px-3 py-1.5 text-xs font-medium bg-whale/10 text-whale border border-whale/20 rounded-lg flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
                Submission Under Review
              </span>
            )}
          </div>
        </div>

        {hasPendingSubmission && isOwner && (
          <div className="bg-whale/5 border border-whale/20 rounded-lg p-3 text-xs text-gray-400">
            Your submission is being reviewed by our team. You'll appear on the leaderboard once approved (typically within 24 hours).
          </div>
        )}

        {/* Current Stats */}
        {currentStats ? (
          <div className="bg-surface-1 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Current Performance</h2>
              {(() => {
                const tierInfo = getTierInfo(currentStats.tier);
                return (
                  <span className={`px-2.5 py-1 text-xs font-medium rounded ${tierInfo.textClass} ${tierInfo.bgClass} border ${tierInfo.borderClass}`}>
                    {tierInfo.emoji} {tierInfo.label} · {tierInfo.range}
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-2 rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Exchange</div>
                <div className="font-medium">{currentStats.exchange}</div>
              </div>

              <div className="bg-surface-2 rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Monthly PnL</div>
                <div
                  className={`text-lg font-mono tabular-nums font-semibold ${
                    currentStats.monthlyPnlPct >= 0 ? 'text-profit' : 'text-loss'
                  }`}
                >
                  {formatPercent(currentStats.monthlyPnlPct)}
                </div>
              </div>

              <div className="bg-surface-2 rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Total PnL</div>
                <div className="text-lg font-mono tabular-nums font-semibold text-profit">
                  {formatCurrency(currentStats.totalPnlUsd)}
                </div>
              </div>

              <div className="bg-surface-2 rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Win Rate</div>
                <div className="text-lg font-mono tabular-nums">{currentStats.winRatePct}%</div>
              </div>

              <div className="bg-surface-2 rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Volume</div>
                <div className="text-lg font-mono tabular-nums">
                  {formatCurrency(currentStats.volumeUsd)}
                </div>
              </div>

              <div className="bg-surface-2 rounded-lg p-4">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Last Updated</div>
                <div className="text-sm">{new Date(currentStats.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-1 border border-border rounded-xl p-12 text-center mb-6">
            <p className="text-gray-400">No approved stats yet</p>
            {isOwner && !hasPendingSubmission && (
              <Link
                href="/submit"
                className="inline-block mt-4 h-10 px-6 text-sm font-medium bg-brand hover:bg-brand/80 text-white rounded-lg transition-colors"
              >
                Submit Your Stats
              </Link>
            )}
          </div>
        )}

        {/* Submission History (Owner Only) */}
        {isOwner && profile.user.submissions.length > 0 && (
          <div className="bg-surface-1 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
            <div className="space-y-3">
              {profile.user.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-surface-2 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium">{submission.exchange}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                          submission.status === 'APPROVED'
                            ? 'bg-profit/10 text-profit'
                            : submission.status === 'REJECTED'
                            ? 'bg-loss/10 text-loss'
                            : 'bg-whale/10 text-whale'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </div>
                    {submission.adminNote && (
                      <div className="mt-2 text-xs text-gray-400">
                        Admin Note: {submission.adminNote}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-mono tabular-nums font-semibold ${
                        submission.monthlyPnlPct >= 0 ? 'text-profit' : 'text-loss'
                      }`}
                    >
                      {formatPercent(submission.monthlyPnlPct)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
