import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ['/dashboard', '/profile', '/admin'];
const authRoutes = ['/login', '/register'];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1];
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Check for auth tokens in cookies
  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  // Handle protected routes
  if (
    protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // Handle auth routes (redirect if already authenticated)
  if (authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url)
      );
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
