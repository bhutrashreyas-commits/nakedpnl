import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submissionSchema, calculateTier } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validated = submissionSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission data', details: validated.error },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        exchange: data.exchange,
        monthlyPnlPct: data.monthlyPnlPct,
        totalPnlUsd: data.totalPnlUsd,
        winRatePct: data.winRatePct,
        volumeUsd: data.volumeUsd,
        proofText: data.proofText || '',
        proofLinks: data.proofLinks || [],
      },
    });
    
    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Submission created successfully. Awaiting admin approval.',
    });
  } catch (error) {
    console.error('Submission API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user's submissions
    const submissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
