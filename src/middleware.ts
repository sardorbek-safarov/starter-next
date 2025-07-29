import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ['/', '/dashboard', '/profile', '/admin'];
const authRoutes = ['/login', '/register'];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = request.nextUrl.locale || 'en';
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Check for auth tokens in cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);
  console.log(locale, pathnameWithoutLocale, isAuthenticated);

  // Handle protected routes
  if (
    protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route)) &&
    !authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))
  ) {
    console.log('Protected route accessed:', pathnameWithoutLocale);

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // // Handle auth routes (redirect if already authenticated)
  if (authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    console.log('Auth route accessed:', pathnameWithoutLocale);
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(`/${locale}/`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
