'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { formatCurrency, formatPercent, getTierInfo, calculateTier } from '@/lib/utils';

type Submission = {
  id: string;
  userId: string;
  exchange: string;
  monthlyPnlPct: number;
  totalPnlUsd: number;
  winRatePct: number;
  volumeUsd: number;
  proofText: string | null;
  proofLinks: string[];
  status: string;
  createdAt: string;
  user: {
    email: string;
    profile: {
      username: string;
      displayName: string;
    } | null;
  };
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchSubmissions();
    }
  }, [status, session, router]);

  async function fetchSubmissions() {
    try {
      const response = await fetch('/api/admin/submissions');
      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data);
      } else {
        setError(data.error || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReview(submissionId: string, action: 'approve' | 'reject', adminNote?: string) {
    setReviewingId(submissionId);
    setError('');

    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          action,
          adminNote,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      } else {
        setError(data.error || 'Failed to review submission');
      }
    } catch (error) {
      console.error('Review error:', error);
      setError('An unexpected error occurred');
    } finally {
      setReviewingId(null);
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-center text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-sm text-gray-400">
            Review and approve pending trader submissions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-loss/10 border border-loss/30 rounded-lg">
            <p className="text-sm text-loss">{error}</p>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-xl p-12 text-center">
            <p className="text-gray-400">No pending submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const tier = calculateTier(submission.volumeUsd);
              const tierInfo = getTierInfo(tier);
              const isReviewing = reviewingId === submission.id;

              return (
                <div
                  key={submission.id}
                  className="bg-surface-1 border border-border rounded-xl p-6 hover:border-border-light transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {submission.user.profile?.displayName || 'Unknown'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          @{submission.user.profile?.username || 'unknown'}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${tierInfo.textClass} ${tierInfo.bgClass} border ${tierInfo.borderClass}`}>
                          {tierInfo.emoji} {tierInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {submission.user.email} • Submitted {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Exchange</div>
                      <div className="font-medium">{submission.exchange}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Monthly PnL</div>
                      <div className={`font-mono tabular-nums font-semibold ${submission.monthlyPnlPct >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercent(submission.monthlyPnlPct)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Total PnL</div>
                      <div className="font-mono tabular-nums font-semibold text-profit">
                        {formatCurrency(submission.totalPnlUsd)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Win Rate</div>
                      <div className="font-mono tabular-nums">{submission.winRatePct}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Volume</div>
                      <div className="font-mono tabular-nums">
                        {formatCurrency(submission.volumeUsd)}
                      </div>
                    </div>
                  </div>

                  {/* Proof */}
                  {(submission.proofText || submission.proofLinks.length > 0) && (
                    <div className="mb-4 pb-4 border-b border-border">
                      {submission.proofText && (
                        <div className="mb-3">
                          <div className="text-[10px] text-gray-500 uppercase mb-1">Description</div>
                          <p className="text-sm text-gray-300">{submission.proofText}</p>
                        </div>
                      )}
                      {submission.proofLinks.length > 0 && (
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase mb-1">Proof Links</div>
                          <div className="space-y-1">
                            {submission.proofLinks.map((link, index) => (
                              <a
                                key={`${submission.id}-proof-${index}`}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-brand hover:underline block"
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (confirm(`Approve submission from ${submission.user.profile?.displayName}? This will publish their stats to the leaderboard.`)) {
                          handleReview(submission.id, 'approve');
                        }
                      }}
                      disabled={isReviewing}
                      className="flex-1 h-10 px-4 text-sm font-medium bg-profit/10 text-profit border border-profit/30 rounded-lg hover:bg-profit/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReviewing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt('Rejection reason (optional):');
                        if (note !== null) {
                          handleReview(submission.id, 'reject', note);
                        }
                      }}
                      disabled={isReviewing}
                      className="flex-1 h-10 px-4 text-sm font-medium bg-loss/10 text-loss border border-loss/30 rounded-lg hover:bg-loss/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
