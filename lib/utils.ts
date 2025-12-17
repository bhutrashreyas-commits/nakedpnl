import { z } from 'zod';
import { Tier, TimeWindow, Exchange } from '@prisma/client';

// Validation schemas
export const submissionSchema = z.object({
  exchange: z.nativeEnum(Exchange),
  monthlyPnlPct: z.number().min(-100).max(1000),
  totalPnlUsd: z.number().min(-1000000).max(10000000),
  winRatePct: z.number().min(0).max(100),
  volumeUsd: z.number().min(0).max(100000000),
  proofText: z.string().optional(),
  proofLinks: z.array(z.string().url()).optional().default([]),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: z.string().min(2).max(50),
  bio: z.string().max(200).optional(),
  twitter: z.string().max(50).optional(),
});

export const adminReviewSchema = z.object({
  submissionId: z.string(),
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
});

// Tier calculation based on volume
export function calculateTier(volumeUsd: number): Tier {
  if (volumeUsd >= 250000) return Tier.WHALE;
  if (volumeUsd >= 50000) return Tier.SHARK;
  return Tier.DOLPHIN;
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format percentage
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// Get tier display info with static Tailwind classes
export function getTierInfo(tier: Tier) {
  switch (tier) {
    case Tier.WHALE:
      return {
        emoji: '🐋',
        label: 'Whale',
        color: 'whale',
        range: '$250k+',
        textClass: 'text-whale',
        bgClass: 'bg-whale/10',
        borderClass: 'border-whale/20',
        hoverBgClass: 'hover:bg-whale/10',
      };
    case Tier.SHARK:
      return {
        emoji: '🦈',
        label: 'Shark',
        color: 'shark',
        range: '$50-250k',
        textClass: 'text-shark',
        bgClass: 'bg-shark/10',
        borderClass: 'border-shark/20',
        hoverBgClass: 'hover:bg-shark/10',
      };
    case Tier.DOLPHIN:
      return {
        emoji: '🐬',
        label: 'Dolphin',
        color: 'dolphin',
        range: '$10-50k',
        textClass: 'text-dolphin',
        bgClass: 'bg-dolphin/10',
        borderClass: 'border-dolphin/20',
        hoverBgClass: 'hover:bg-dolphin/10',
      };
  }
}

// Get time window label
export function getTimeWindowLabel(window: TimeWindow): string {
  switch (window) {
    case TimeWindow.THIS_MONTH:
      return 'This Month';
    case TimeWindow.THREE_MONTHS:
      return '3M';
    case TimeWindow.SIX_MONTHS:
      return '6M';
    case TimeWindow.YTD:
      return 'YTD';
    case TimeWindow.ALL_TIME:
      return 'All-Time';
  }
}

// Safe number parsing
export function safeParseFloat(value: string | number | undefined | null): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function safeParseInt(value: string | number | undefined | null): number {
  if (typeof value === 'number') return Math.floor(value);
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// Safe number parser with error throwing for form validation
export function safeParseNumber(value: string, fieldName: string): number {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return parsed;
}
