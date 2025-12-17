import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function AuthError() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-lg mx-auto px-4 py-20">
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-loss/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-loss"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-gray-400 mb-6">
            There was a problem signing you in. Please try again.
          </p>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-6 text-sm font-medium bg-brand hover:bg-brand/80 text-white rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
