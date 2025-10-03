import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id;
    
    const page = await prisma.landingPage.delete({
      where: { id: pageId }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Page deleted successfully' 
    });
    
  } catch (error) {
    console.error('Page deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id;
    
    const page = await prisma.landingPage.findUnique({
      where: { id: pageId }
    });
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ page });
    
  } catch (error) {
    console.error('Failed to get page:', error);
    return NextResponse.json(
      { error: 'Failed to get page' },
      { status: 500 }
    );
  }
}