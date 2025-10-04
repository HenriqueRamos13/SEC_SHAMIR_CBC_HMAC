import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect to login if accessing protected route without token
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing login/register with token
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
