import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple session check using cookie - avoid importing heavy auth modules in middleware
export default async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  
  // Check for auth session cookie
  const sessionCookie = cookies.get('authjs.session-token')?.value || 
                        cookies.get('__Secure-authjs.session-token')?.value;
  const isLoggedIn = !!sessionCookie;
  
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = nextUrl.pathname === '/' || 
                        nextUrl.pathname === '/offline' ||
                        nextUrl.pathname.startsWith('/icons') ||
                        nextUrl.pathname.startsWith('/manifest') ||
                        nextUrl.pathname.startsWith('/sw.js') ||
                        nextUrl.pathname.startsWith('/workbox');
  const isProtectedRoute = 
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/transactions') ||
    nextUrl.pathname.startsWith('/categories') ||
    nextUrl.pathname.startsWith('/budgets') ||
    nextUrl.pathname.startsWith('/settings') ||
    (nextUrl.pathname.startsWith('/api') && !isApiAuthRoute && nextUrl.pathname !== '/api/debug-env' && nextUrl.pathname !== '/api/debug2' && nextUrl.pathname !== '/api/health');

  // Allow API auth routes and public assets
  if (isApiAuthRoute || nextUrl.pathname.match(/\.(js|css|png|svg|json|ico)$/)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to home page
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // Redirect authenticated users away from public pages
  if (isPublicRoute && isLoggedIn && nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:png|svg|js|css)$).*)'],
};
