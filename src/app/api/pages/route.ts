import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, template, content, seoTitle, seoDescription, status } = body;
    
    const page = await prisma.landingPage.create({
      data: {
        name,
        slug,
        template: template || 'custom',
        content: content || [],
        seoTitle,
        seoDescription,
        status: status || 'DRAFT'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      page 
    });
    
  } catch (error) {
    console.error('Page creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create page' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('id');
    
    if (pageId) {
      // Get specific page
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
    } else {
      // Get all pages
      const pages = await prisma.landingPage.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      
      return NextResponse.json({ pages });
    }
    
  } catch (error) {
    console.error('Failed to get pages:', error);
    return NextResponse.json(
      { error: 'Failed to get pages' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, content, seoTitle, seoDescription, status } = body;
    
    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        name,
        slug,
        content,
        seoTitle,
        seoDescription,
        status
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      page 
    });
    
  } catch (error) {
    console.error('Page update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update page' },
      { status: 500 }
    );
  }
}