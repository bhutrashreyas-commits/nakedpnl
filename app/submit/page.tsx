'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Exchange } from '@prisma/client';
import { safeParseNumber } from '@/lib/utils';

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    exchange: Exchange.BINANCE,
    monthlyPnlPct: '',
    totalPnlUsd: '',
    winRatePct: '',
    volumeUsd: '',
    proofText: '',
    proofLinks: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  async function fetchProfile() {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.success && data.data) {
        setProfile(data.data);
        setFormData(prev => ({
          ...prev,
          username: data.data.username,
          displayName: data.data.displayName,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // First, create/update profile if needed
      if (!profile || formData.username !== profile.username || formData.displayName !== profile.displayName) {
        const profileResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            displayName: formData.displayName,
          }),
        });

        const profileData = await profileResponse.json();
        
        if (!profileData.success) {
          setError(profileData.error || 'Failed to save profile');
          setIsSubmitting(false);
          return;
        }
        
        setProfile(profileData.data);
      }

      // Then submit stats
      const proofLinksArray = formData.proofLinks
        .split('\n')
        .map(link => link.trim())
        .filter(link => link.length > 0);

      try {
        const submissionResponse = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exchange: formData.exchange,
            monthlyPnlPct: safeParseNumber(formData.monthlyPnlPct, 'Monthly PnL'),
            totalPnlUsd: safeParseNumber(formData.totalPnlUsd, 'Total PnL'),
            winRatePct: safeParseNumber(formData.winRatePct, 'Win Rate'),
            volumeUsd: safeParseNumber(formData.volumeUsd, 'Volume'),
            proofText: formData.proofText,
            proofLinks: proofLinksArray,
          }),
        });

        const submissionData = await submissionResponse.json();

        if (!submissionData.success) {
          // More specific error messages
          const errorMsg = submissionData.error || 'Failed to submit';
          
          if (errorMsg.includes('Invalid submission data')) {
            setError('Please check all fields and try again. Make sure numbers are valid.');
          } else if (errorMsg.includes('Unauthorized')) {
            setError('Your session expired. Please refresh and sign in again.');
          } else {
            setError(errorMsg);
          }
          setIsSubmitting(false);
          return;
        }

        setSuccess('Submission successful! Awaiting admin approval.');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(`/trader/${formData.username}`);
        }, 2000);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Invalid input values. Please check all fields.');
        }
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoadingProfile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="text-center text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Submit Your Stats</h1>
          <p className="text-sm text-gray-400">
            Share your verified trading performance. Your submission will be reviewed by our team before appearing on the leaderboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-loss/10 border border-loss/30 rounded-lg">
            <p className="text-sm text-loss">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-profit/10 border border-profit/30 rounded-lg">
            <p className="text-sm text-profit">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Section */}
          <div className="bg-surface-1 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1.5">
                  Username <span className="text-loss">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!!profile}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  minLength={3}
                  maxLength={20}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="cryptoking"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {profile ? 'Username cannot be changed' : 'Letters, numbers, and underscores only'}
                </p>
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-1.5">
                  Display Name <span className="text-loss">*</span>
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="CryptoKing"
                />
              </div>
            </div>
          </div>

          {/* Trading Stats Section */}
          <div className="bg-surface-1 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Trading Performance</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="exchange" className="block text-sm font-medium mb-1.5">
                  Exchange <span className="text-loss">*</span>
                </label>
                <select
                  id="exchange"
                  name="exchange"
                  value={formData.exchange}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                >
                  <option value={Exchange.BINANCE}>Binance</option>
                  <option value={Exchange.BYBIT}>Bybit</option>
                  <option value={Exchange.OKX}>OKX</option>
                  <option value={Exchange.COINBASE}>Coinbase</option>
                  <option value={Exchange.KRAKEN}>Kraken</option>
                  <option value={Exchange.OTHER}>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthlyPnlPct" className="block text-sm font-medium mb-1.5">
                    Monthly PnL (%) <span className="text-loss">*</span>
                  </label>
                  <input
                    type="number"
                    id="monthlyPnlPct"
                    name="monthlyPnlPct"
                    value={formData.monthlyPnlPct}
                    onChange={handleChange}
                    required
                    step="0.1"
                    min="-100"
                    max="1000"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="24.8"
                  />
                </div>

                <div>
                  <label htmlFor="totalPnlUsd" className="block text-sm font-medium mb-1.5">
                    Total PnL (USD) <span className="text-loss">*</span>
                  </label>
                  <input
                    type="number"
                    id="totalPnlUsd"
                    name="totalPnlUsd"
                    value={formData.totalPnlUsd}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="542109"
                  />
                </div>

                <div>
                  <label htmlFor="winRatePct" className="block text-sm font-medium mb-1.5">
                    Win Rate (%) <span className="text-loss">*</span>
                  </label>
                  <input
                    type="number"
                    id="winRatePct"
                    name="winRatePct"
                    value={formData.winRatePct}
                    onChange={handleChange}
                    required
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="78"
                  />
                </div>

                <div>
                  <label htmlFor="volumeUsd" className="block text-sm font-medium mb-1.5">
                    Trading Volume (USD) <span className="text-loss">*</span>
                  </label>
                  <input
                    type="number"
                    id="volumeUsd"
                    name="volumeUsd"
                    value={formData.volumeUsd}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="2500000"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Determines your tier (Dolphin: $10k-50k, Shark: $50k-250k, Whale: $250k+)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Proof Section */}
          <div className="bg-surface-1 border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Verification Proof</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="proofText" className="block text-sm font-medium mb-1.5">
                  Description / Notes
                </label>
                <textarea
                  id="proofText"
                  name="proofText"
                  value={formData.proofText}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                  placeholder="Provide context about your trading strategy, timeframe, or verification method..."
                />
              </div>

              <div>
                <label htmlFor="proofLinks" className="block text-sm font-medium mb-1.5">
                  Proof Links (optional)
                </label>
                <textarea
                  id="proofLinks"
                  name="proofLinks"
                  value={formData.proofLinks}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                  placeholder="https://example.com/proof1&#10;https://example.com/proof2&#10;One link per line"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Screenshots, exchange statements, or other verification documents (one link per line)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-hyper h-10 px-6 text-sm font-bold text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin-slow w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit for Review</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
