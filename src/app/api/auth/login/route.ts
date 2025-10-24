import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Read the request body as text first, then parse
    const bodyText = await request.text();
    
    
    if (!bodyText) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw body that failed to parse:', bodyText);
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check environment variables for admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured in environment variables');
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 503 }
      );
    }


    // Validate admin credentials
    if (email === adminEmail && password === adminPassword) {
      // Try to find or create admin user in database
      let user = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      // Create admin user if doesn't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: adminEmail,
            firstName: 'Admin',
            lastName: 'User',
            role: 'SUPER_ADMIN',
            isActive: true
          }
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt.toISOString()
        },
        token: `admin-token-${Date.now()}`
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}