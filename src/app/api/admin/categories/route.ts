import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { adminCategories } from '@/components/admin/AdminDashboard';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // For demo purposes, return all categories without database check
    // In production, this would check user permissions from database
    console.log('Demo mode: Returning all admin categories for user:', userId);
    
    return NextResponse.json({
      success: true,
      categories: adminCategories,
      demoMode: true
    });

  } catch (error) {
    console.error('Error fetching filtered categories:', error);
    
    // Fallback to all categories if filtering fails
    return NextResponse.json({
      success: true,
      categories: adminCategories
    });
  }
}