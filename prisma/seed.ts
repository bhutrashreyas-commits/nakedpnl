import { PrismaClient, Exchange, Tier, TimeWindow, SubmissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo traders with approved stats
  const traders = [
    {
      email: 'cryptoking@example.com',
      username: 'cryptoking',
      displayName: 'CryptoKing',
      avatar: '🦁',
      exchange: Exchange.BINANCE,
      monthlyPnlPct: 24.8,
      totalPnlUsd: 542109,
      winRatePct: 78,
      volumeUsd: 2500000,
      tier: Tier.WHALE,
    },
    {
      email: 'swingmaster@example.com',
      username: 'swingmaster',
      displayName: 'SwingMaster',
      avatar: '🐺',
      exchange: Exchange.BYBIT,
      monthlyPnlPct: 18.2,
      totalPnlUsd: 187420,
      winRatePct: 71,
      volumeUsd: 180000,
      tier: Tier.SHARK,
    },
    {
      email: 'ethwhale@example.com',
      username: 'ethwhale',
      displayName: 'ETHWhale',
      avatar: '🦅',
      exchange: Exchange.OKX,
      monthlyPnlPct: 14.6,
      totalPnlUsd: 412830,
      winRatePct: 69,
      volumeUsd: 300000,
      tier: Tier.WHALE,
    },
    {
      email: 'althunter@example.com',
      username: 'althunter',
      displayName: 'AltHunter',
      avatar: '🐻',
      exchange: Exchange.BINANCE,
      monthlyPnlPct: 11.2,
      totalPnlUsd: 38210,
      winRatePct: 64,
      volumeUsd: 45000,
      tier: Tier.DOLPHIN,
    },
    {
      email: 'degentrader@example.com',
      username: 'degentrader',
      displayName: 'DegenTrader',
      avatar: '🦊',
      exchange: Exchange.BYBIT,
      monthlyPnlPct: 9.1,
      totalPnlUsd: 124580,
      winRatePct: 61,
      volumeUsd: 150000,
      tier: Tier.SHARK,
    },
    {
      email: 'momentumv@example.com',
      username: 'momentumv',
      displayName: 'MomentumV',
      avatar: '🐼',
      exchange: Exchange.OKX,
      monthlyPnlPct: -3.1,
      totalPnlUsd: 89120,
      winRatePct: 52,
      volumeUsd: 120000,
      tier: Tier.SHARK,
    },
    {
      email: 'btcholder@example.com',
      username: 'btcholder',
      displayName: 'BTCHolder',
      avatar: '🐯',
      exchange: Exchange.BINANCE,
      monthlyPnlPct: 7.2,
      totalPnlUsd: 298450,
      winRatePct: 58,
      volumeUsd: 280000,
      tier: Tier.WHALE,
    },
    {
      email: 'scalpking@example.com',
      username: 'scalpking',
      displayName: 'ScalpKing',
      avatar: '🦎',
      exchange: Exchange.BYBIT,
      monthlyPnlPct: -5.4,
      totalPnlUsd: 27340,
      winRatePct: 48,
      volumeUsd: 35000,
      tier: Tier.DOLPHIN,
    },
  ];

  for (const trader of traders) {
    console.log(`Creating trader: ${trader.username}`);

    // Create user
    const user = await prisma.user.upsert({
      where: { email: trader.email },
      update: {},
      create: {
        email: trader.email,
        emailVerified: new Date(),
      },
    });

    // Create profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        username: trader.username,
        displayName: trader.displayName,
        avatar: trader.avatar,
      },
    });

    // Create approved submission
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        exchange: trader.exchange,
        monthlyPnlPct: trader.monthlyPnlPct,
        totalPnlUsd: trader.totalPnlUsd,
        winRatePct: trader.winRatePct,
        volumeUsd: trader.volumeUsd,
        proofText: 'Demo data - verified by exchange API',
        proofLinks: [],
        status: SubmissionStatus.APPROVED,
        reviewedAt: new Date(),
      },
    });

    // Create approved stats for THIS_MONTH
    await prisma.approvedStats.create({
      data: {
        userId: user.id,
        exchange: trader.exchange,
        window: TimeWindow.THIS_MONTH,
        monthlyPnlPct: trader.monthlyPnlPct,
        totalPnlUsd: trader.totalPnlUsd,
        winRatePct: trader.winRatePct,
        volumeUsd: trader.volumeUsd,
        tier: trader.tier,
        submissionId: submission.id,
      },
    });

    console.log(`✅ Created ${trader.username}`);
  }

  // Create an admin user
  console.log('Creating admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@nakedpnl.com' },
    update: {},
    create: {
      email: 'admin@nakedpnl.com',
      emailVerified: new Date(),
      profile: {
        create: {
          username: 'admin',
          displayName: 'Admin',
        },
      },
    },
  });
  console.log('✅ Admin user created');

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
