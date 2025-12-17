# NakedPnL MVP

A public leaderboard website for traders to showcase verified profits. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- 📊 **Public Leaderboard** - Display verified traders ranked by performance
- 🔐 **Email Magic Link Auth** - Passwordless authentication via NextAuth
- 📝 **Trader Submissions** - Submit trading stats for review
- 👨‍💼 **Admin Review Dashboard** - Approve/reject submissions
- 👤 **Trader Profiles** - Public profile pages for each trader
- 🏆 **Tier System** - Automatic tier assignment (Dolphin/Shark/Whale) based on volume
- 🎨 **Polished UI** - Matching the provided design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon or Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Email provider)
- **Validation**: Zod
- **Deployment**: Vercel

## Project Structure

```
nakedpnl-mvp/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── leaderboard/       # Leaderboard data
│   │   ├── profile/           # User profiles
│   │   ├── submit/            # Submissions
│   │   └── admin/             # Admin review
│   ├── admin/                 # Admin dashboard page
│   ├── submit/                # Submission form page
│   ├── trader/[username]/     # Trader profile pages
│   ├── auth/error/            # Auth error page
│   ├── verify-request/        # Email verification page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page (server component)
│   ├── LeaderboardClient.tsx  # Client-side leaderboard
│   ├── providers.tsx          # SessionProvider wrapper
│   └── globals.css            # Global styles
├── components/
│   └── Navbar.tsx             # Navigation component
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client singleton
│   └── utils.ts              # Utility functions & schemas
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
└── package.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (Neon or Supabase recommended)
- SMTP email service (Gmail, SendGrid, etc.)

### 2. Clone and Install

```bash
# Navigate to project directory
cd nakedpnl-mvp

# Install dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database (Get from Neon or Supabase)
DATABASE_URL="postgresql://user:password@host:5432/nakedpnl?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-with-openssl-rand-base64-32"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@nakedpnl.com"

# Admin Access (comma-separated emails)
ADMIN_EMAILS="admin@nakedpnl.com,your-email@gmail.com"
```

#### Getting a Database URL:

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string from the dashboard
5. Paste it as `DATABASE_URL` in `.env`

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the "Connection string" (choose "Session pooler" mode)
5. Replace `[YOUR-PASSWORD]` with your database password
6. Paste it as `DATABASE_URL` in `.env`

#### Email Setup (Gmail Example):

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password":
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this as `EMAIL_SERVER_PASSWORD`
3. Use your Gmail address as `EMAIL_SERVER_USER`

#### Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 4. Initialize Database

```bash
# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

This will create 8 demo traders matching the design from your HTML file.

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Test the Application

1. **View Leaderboard**: See the seeded traders on the homepage
2. **Sign In**: Click "Connect" and enter your email
3. **Check Email**: Click the magic link sent to your inbox
4. **Submit Stats**: Go to `/submit` and fill out the form
5. **Admin Review**: If your email is in `ADMIN_EMAILS`, go to `/admin` to approve submissions
6. **View Profile**: After approval, visit `/trader/your-username`

## Database Schema

### Key Models

- **User**: NextAuth user accounts
- **Profile**: Public trader profiles (username, displayName, etc.)
- **Submission**: Pending/approved/rejected stat submissions
- **ApprovedStats**: Published leaderboard entries (per time window)

### Tier System

Tiers are automatically calculated based on trading volume:
- 🐬 **Dolphin**: $10k - $50k
- 🦈 **Shark**: $50k - $250k
- 🐋 **Whale**: $250k+

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/nakedpnl-mvp.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)

### 3. Add Environment Variables

In Vercel project settings → Environment Variables, add all variables from your `.env`:
- `DATABASE_URL`
- `NEXTAUTH_URL` (set to your Vercel deployment URL, e.g., `https://nakedpnl.vercel.app`)
- `NEXTAUTH_SECRET`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`
- `ADMIN_EMAILS`

### 4. Deploy

Vercel will automatically build and deploy your app. On subsequent pushes to `main`, it will auto-deploy.

### 5. Initialize Production Database

After first deployment, run migrations in production:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run seed command in production
vercel env pull .env.local
npx prisma db push
npm run db:seed
```

## API Endpoints

### Public Endpoints

- `GET /api/leaderboard` - Get leaderboard data
  - Query params: `window`, `tier`, `page`, `limit`

### Authenticated Endpoints

- `POST /api/profile` - Create/update profile
- `GET /api/profile` - Get current user profile
- `POST /api/submit` - Submit trading stats
- `GET /api/submit` - Get user's submissions

### Admin Endpoints

- `GET /api/admin/submissions` - List pending submissions
- `POST /api/admin/submissions` - Approve/reject submission

## Admin Access

To grant admin access to a user:
1. Add their email to the `ADMIN_EMAILS` environment variable (comma-separated)
2. Restart the development server or redeploy
3. They will see an "Admin" link in the navbar after signing in

## Development Tips

### Database Management

```bash
# View database in browser
npm run db:studio

# Reset database (caution: deletes all data)
npx prisma db push --force-reset

# Re-seed after reset
npm run db:seed
```

### Type Safety

The project uses TypeScript with strict mode. Prisma generates types automatically when you run `npm install` or `npx prisma generate`.

### Linting

```bash
npm run lint
```

## Future Enhancements (Scaffolded)

The data model is structured to support:

1. **On-chain Address Verification**
   - Add `walletAddress` field to Profile
   - Verify ownership via signature

2. **Exchange API Integration**
   - Add `apiKeyHash` and `apiSecretHash` to Profile
   - Implement read-only API connection for auto-verification

3. **Multiple Time Windows**
   - Already supported in schema (`TimeWindow` enum)
   - Extend admin approval to create stats for multiple windows

4. **Historical Performance**
   - Track performance over time
   - Add charts and analytics

## Troubleshooting

### Email not sending

- Check SMTP credentials
- Ensure 2FA is enabled and you're using an app password
- Check spam folder
- Try a different email provider (SendGrid, Mailgun, etc.)

### Database connection issues

- Verify `DATABASE_URL` is correct
- Ensure database is accessible (check firewall/IP allowlist)
- For Neon: Make sure `sslmode=require` is in connection string

### Type errors

```bash
npx prisma generate
```

### Build errors on Vercel

- Check environment variables are set correctly
- Ensure `DATABASE_URL` works from Vercel's servers
- Check build logs for specific error messages

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Next.js, Prisma, and NextAuth documentation
3. Create an issue in the repository

## License

MIT
