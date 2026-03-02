import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = nextUrl.pathname === '/';
  const isProtectedRoute = 
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/transactions') ||
    nextUrl.pathname.startsWith('/categories') ||
    nextUrl.pathname.startsWith('/budgets') ||
    nextUrl.pathname.startsWith('/settings') ||
    (nextUrl.pathname.startsWith('/api') && !isApiAuthRoute);

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to home page
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // Redirect authenticated users away from public pages
  if (isPublicRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.svg$).*)'],
};
