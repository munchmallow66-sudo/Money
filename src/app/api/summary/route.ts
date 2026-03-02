import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { summaryService } from '@/services/summary.service';

// GET /api/summary - Get dashboard summary data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') 
      ? parseInt(searchParams.get('month')!) 
      : new Date().getMonth() + 1;
    const year = searchParams.get('year') 
      ? parseInt(searchParams.get('year')!) 
      : new Date().getFullYear();

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2020 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      );
    }

    const data = await summaryService.getDashboardData(session.user.id, month, year);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
