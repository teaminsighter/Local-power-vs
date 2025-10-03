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

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.role === 'SUPER_ADMIN') {
      // Super admins see all categories
      return NextResponse.json({
        success: true,
        categories: adminCategories
      });
    }

    // Get user permissions
    const permissions = await prisma.userPermission.findMany({
      where: { userId }
    });

    // Filter categories based on permissions
    const filteredCategories = adminCategories.map(category => ({
      ...category,
      tabs: category.tabs.filter(tab => {
        const permission = permissions.find(p => 
          p.category === category.id && p.tab === tab.id
        );
        return permission?.canView === true;
      })
    })).filter(category => category.tabs.length > 0);

    return NextResponse.json({
      success: true,
      categories: filteredCategories
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