import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        AUTH_URL: process.env.AUTH_URL || 'NOT SET',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
        VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
        VERCEL: process.env.VERCEL || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    });
}
