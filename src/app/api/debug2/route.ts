import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        AUTH_URL: process.env.AUTH_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        VERCEL_URL: process.env.VERCEL_URL,
        VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV,
        TRUST_HOST: process.env.AUTH_TRUST_HOST,
        HOST_HEADER: process.env.HOST,
    });
}
