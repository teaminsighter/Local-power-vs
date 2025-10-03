import { NextRequest, NextResponse } from 'next/server';
import { permissionsService } from '@/services/permissionsService';

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

    const permissions = await permissionsService.getUserPermissionsWithTabs(userId);

    return NextResponse.json({
      success: true,
      permissions
    });

  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, permissions } = body;

    if (!userId || !permissions) {
      return NextResponse.json(
        { error: 'User ID and permissions are required' },
        { status: 400 }
      );
    }

    await permissionsService.setUserPermissions(userId, permissions);

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully'
    });

  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update user permissions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, tab, permissions } = body;

    if (!userId || !category || !tab || !permissions) {
      return NextResponse.json(
        { error: 'User ID, category, tab, and permissions are required' },
        { status: 400 }
      );
    }

    await permissionsService.updatePermission(userId, category, tab, permissions);

    return NextResponse.json({
      success: true,
      message: 'Permission updated successfully'
    });

  } catch (error) {
    console.error('Error updating permission:', error);
    return NextResponse.json(
      { error: 'Failed to update permission' },
      { status: 500 }
    );
  }
}