import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminReviewSchema, calculateTier } from '@/lib/utils';
import { SubmissionStatus, TimeWindow } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Get pending submissions
    const submissions = await prisma.submission.findMany({
      where: {
        status: SubmissionStatus.PENDING,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
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
    console.error('Admin get submissions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate input
    const validated = adminReviewSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid review data', details: validated.error },
        { status: 400 }
      );
    }
    
    const { submissionId, action, adminNote } = validated.data;
    
    // Get submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    if (submission.status !== SubmissionStatus.PENDING) {
      return NextResponse.json(
        { success: false, error: 'Submission already reviewed' },
        { status: 400 }
      );
    }
    
    // Update submission status
    const newStatus = action === 'approve' ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;
    
    // If approved, create/update ApprovedStats using transaction
    if (action === 'approve') {
      const tier = calculateTier(submission.volumeUsd);
      
      // Use transaction to prevent race conditions
      await prisma.$transaction(async (tx) => {
        // Double-check submission hasn't been approved
        const currentSubmission = await tx.submission.findUnique({
          where: { id: submissionId },
        });
        
        if (currentSubmission?.status !== SubmissionStatus.PENDING) {
          throw new Error('Submission already processed');
        }
        
        // Update submission
        await tx.submission.update({
          where: { id: submissionId },
          data: {
            status: newStatus,
            adminNote: adminNote || null,
            reviewedAt: new Date(),
            reviewedBy: session.user.email || session.user.id,
          },
        });
        
        // Create/update stats for THIS_MONTH window
        await tx.approvedStats.upsert({
          where: {
            userId_window: {
              userId: submission.userId,
              window: TimeWindow.THIS_MONTH,
            },
          },
          update: {
            exchange: submission.exchange,
            monthlyPnlPct: submission.monthlyPnlPct,
            totalPnlUsd: submission.totalPnlUsd,
            winRatePct: submission.winRatePct,
            volumeUsd: submission.volumeUsd,
            tier,
            submissionId: submission.id,
          },
          create: {
            userId: submission.userId,
            exchange: submission.exchange,
            window: TimeWindow.THIS_MONTH,
            monthlyPnlPct: submission.monthlyPnlPct,
            totalPnlUsd: submission.totalPnlUsd,
            winRatePct: submission.winRatePct,
            volumeUsd: submission.volumeUsd,
            tier,
            submissionId: submission.id,
          },
        });
      });
      
      return NextResponse.json({
        success: true,
        message: `Submission approved successfully`,
      });
    } else {
      // Just update submission for rejection
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: newStatus,
          adminNote: adminNote || null,
          reviewedAt: new Date(),
          reviewedBy: session.user.email || session.user.id,
        },
      });
      
      return NextResponse.json({
        success: true,
        data: updatedSubmission,
        message: `Submission rejected successfully`,
      });
    }
  } catch (error) {
    // Log full error details for debugging
    console.error('Admin review error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Return safe error to client
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error && error.message.includes('already processed') 
          ? error.message 
          : 'Failed to review submission. Please try again.' 
      },
      { status: 500 }
    );
  }
}
