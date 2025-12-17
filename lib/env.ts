// Validate required env vars on startup
function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM',
    'ADMIN_EMAILS',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}`
    );
  }
}

// Run validation (will throw if invalid)
if (typeof window === 'undefined') {
  validateEnv();
}

// Export typed env vars
export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  nextAuthUrl: process.env.NEXTAUTH_URL!,
  nextAuthSecret: process.env.NEXTAUTH_SECRET!,
  adminEmails: process.env.ADMIN_EMAILS!.split(',').map(e => e.trim()),
};
