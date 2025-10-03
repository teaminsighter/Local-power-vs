import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Create or update super admin user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: 'SUPER_ADMIN',
        isActive: true
      },
      create: {
        email,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    // Super admins don't need explicit permissions - they have access to everything

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      message: 'Super admin created successfully'
    });

  } catch (error) {
    console.error('Error creating super admin:', error);
    return NextResponse.json(
      { error: 'Failed to create super admin' },
      { status: 500 }
    );
  }
}