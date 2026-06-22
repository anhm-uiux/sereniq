import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lightweight route protection: checks for the presence of a Supabase auth
 * cookie rather than constructing a full @supabase/ssr client. This avoids
 * a known Next.js 14.2.x + @supabase/ssr middleware incompatibility
 * (__dirname is not defined) that occurs even with runtime = 'nodejs' set.
 * Pages themselves still verify the real session client-side; this is a
 * fast, cheap first-pass redirect only.
 */
export function middleware(request: NextRequest) {
  const isAppRoute =
    request.nextUrl.pathname.startsWith('/home') ||
    request.nextUrl.pathname.startsWith('/chat') ||
    request.nextUrl.pathname.startsWith('/trends');

  if (!isAppRoute) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.getAll().some((c) =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  if (!hasAuthCookie) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
