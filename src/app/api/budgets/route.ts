import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { budgetSchema } from '@/lib/validations';

// GET /api/budgets - List all budgets
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

    const where: any = {
      userId: session.user.id,
    };

    if (month) where.month = month;
    if (year) where.year = year;

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('GET /api/budgets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = budgetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { categoryId, month, year, limit } = validation.data;

    // Verify category belongs to user if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Check for duplicate budget
    const existing = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId: categoryId || null,
          month,
          year,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Budget already exists for this period' },
        { status: 409 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId: categoryId || null,
        month,
        year,
        limit,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('POST /api/budgets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
