import { Navbar } from '@/components/Navbar';

export default function VerifyRequest() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-lg mx-auto px-4 py-20">
        <div className="bg-surface-1 border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-400 mb-6">
            A sign in link has been sent to your email address. Click the link to sign in to your account.
          </p>
          
          <div className="bg-surface-2 border border-border rounded-lg p-4 text-left">
            <p className="text-sm text-gray-400">
              <strong className="text-gray-300">Note:</strong> The link will expire in 24 hours. If you don't see the email, check your spam folder.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
