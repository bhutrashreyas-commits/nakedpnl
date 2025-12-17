import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/utils';

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
    const validated = profileSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid profile data', details: validated.error },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    
    // Check if username is taken
    const existingProfile = await prisma.profile.findUnique({
      where: { username: data.username },
    });
    
    if (existingProfile && existingProfile.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 400 }
      );
    }
    
    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        twitter: data.twitter,
      },
      create: {
        userId: session.user.id,
        username: data.username,
        displayName: data.displayName,
        bio: data.bio,
        twitter: data.twitter,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save profile' },
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
    
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });
    
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
