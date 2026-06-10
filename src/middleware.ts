import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/signup'];
const ROLE_PATHS = ['admin', 'manager', 'supervisor', 'staff', 'stakeholder', 'tenant'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(p => pathname === p) || pathname.startsWith('/_next');
  const authCookie = request.cookies.get('fixflow-auth')?.value;
  const roleCookie = request.cookies.get('fixflow-role')?.value;

  // Not logged in, trying to access protected route
  if (!authCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in, trying to access login/register
  if (authCookie && (pathname === '/login' || pathname === '/register')) {
    const role = roleCookie || 'admin';
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
