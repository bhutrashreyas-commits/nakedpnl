'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export function Navbar() {
  const { data: session, status } = useSession();
  
  return (
    <header className="sticky top-0 z-50 bg-surface-0/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-11 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-shark to-whale flex items-center justify-center text-[10px] font-bold">
            N
          </div>
          <span className="font-semibold text-sm">NakedPnL</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse-live"></span>
            Live
          </div>
          
          {status === 'loading' ? (
            <div className="h-7 px-3 text-[11px] font-medium bg-surface-3 border border-border rounded-md">
              Loading...
            </div>
          ) : session ? (
            <div className="flex items-center gap-2">
              {session.user.isAdmin && (
                <Link
                  href="/admin"
                  className="h-7 px-3 text-[11px] font-medium text-whale hover:bg-whale/10 border border-whale/30 rounded-md transition-all"
                >
                  Admin
                </Link>
              )}
              {session.user.username && (
                <Link
                  href={`/trader/${session.user.username}`}
                  className="h-7 px-3 text-[11px] font-medium bg-surface-3 hover:bg-surface-4 border border-border rounded-md transition-all hover:border-border-light"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="h-7 px-3 text-[11px] font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('email')}
              className="h-7 px-3 text-[11px] font-medium bg-surface-3 hover:bg-surface-4 border border-border rounded-md transition-all hover:border-border-light"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
