# NakedPnL MVP - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
cd nakedpnl-mvp
npm install
```

### Step 2: Get a Database (Choose One)

**Option A: Neon (Recommended - 30 seconds)**
```bash
# 1. Visit https://neon.tech
# 2. Sign up (free)
# 3. Create project
# 4. Copy connection string
```

**Option B: Supabase**
```bash
# 1. Visit https://supabase.com
# 2. Create project
# 3. Settings → Database → Copy connection string
# 4. Replace [YOUR-PASSWORD] with your DB password
```

### Step 3: Setup Email (Gmail Example)

```bash
# 1. Enable 2FA on Google Account
# 2. Go to: Google Account → Security → 2-Step Verification → App passwords
# 3. Generate app password for "Mail"
# 4. Copy the 16-character password
```

### Step 4: Create .env File

```bash
# Copy the example
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="your-neon-or-supabase-url-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="youremail@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="noreply@nakedpnl.com"
ADMIN_EMAILS="youremail@gmail.com"
```

### Step 5: Initialize Database

```bash
npm run db:push
npm run db:seed
```

### Step 6: Run!

```bash
npm run dev
```

Visit: http://localhost:3000

## 🧪 Test It Out

1. **View Leaderboard** - See 8 demo traders on homepage
2. **Sign In** - Click "Connect", enter your email, click magic link
3. **Submit Stats** - Visit `/submit` and fill form
4. **Admin Panel** - Visit `/admin` to approve (your email must be in ADMIN_EMAILS)
5. **Profile** - Visit `/trader/your-username`

## 📦 Deploy to Vercel (5 minutes)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/nakedpnl-mvp.git
git push -u origin main

# 2. Go to vercel.com
# 3. Import your repo
# 4. Add all .env variables
# 5. Change NEXTAUTH_URL to your Vercel URL
# 6. Deploy!
```

After deployment, seed production DB:
```bash
npm i -g vercel
vercel link
vercel env pull .env.production
npx prisma db push
npm run db:seed
```

## 🐛 Common Issues

**Email not sending?**
- Use Gmail app password (not regular password)
- Check spam folder
- Verify 2FA is enabled

**Database error?**
- Check DATABASE_URL has no typos
- Ensure `?sslmode=require` is at end (for Neon)
- Verify DB is accessible

**Types not working?**
```bash
npx prisma generate
```

## 📚 What's Included

- ✅ Public leaderboard with filtering
- ✅ Email magic link auth
- ✅ Submission form with validation
- ✅ Admin review dashboard
- ✅ Trader profile pages
- ✅ Automatic tier assignment
- ✅ Mobile responsive
- ✅ Server-side rendering
- ✅ Type-safe with TypeScript
- ✅ Production-ready

## 🎨 Key Features

- **3 Tiers**: Dolphin ($10k-50k), Shark ($50k-250k), Whale ($250k+)
- **Time Windows**: This Month, 3M, 6M, YTD, All-Time (MVP: This Month active)
- **Stats Tracked**: Monthly PnL %, Total PnL $, Win Rate %, Volume $
- **Exchanges**: Binance, Bybit, OKX, Coinbase, Kraken, Other

## 🔧 Commands Cheat Sheet

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to DB
npm run db:seed      # Seed with demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
```

## 📖 Full Documentation

See `README.md` for complete documentation, API reference, and troubleshooting.
