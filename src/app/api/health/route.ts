import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    return NextResponse.json({
        timestamp: new Date().toISOString(),
        version: '2026-03-10-v2',
        env: {
            AUTH_URL: process.env.AUTH_URL || 'NOT SET',
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
            AUTH_SECRET: process.env.AUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET (hidden)' : 'NOT SET',
            GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
            DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
            VERCEL: process.env.VERCEL || 'NOT SET',
            VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
            VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL || 'NOT SET',
            NODE_ENV: process.env.NODE_ENV || 'NOT SET',
            AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'NOT SET',
        },
        computed: {
            derivedUrl: vercelUrl ? `https://${vercelUrl}` : 'NO VERCEL URL AVAILABLE',
        }
    });
}
