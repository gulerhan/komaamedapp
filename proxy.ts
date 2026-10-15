import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const localePrefix = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefixed = pathname.match(localePrefix);
  const bare = (prefixed ? pathname.slice(prefixed[0].length) : pathname).replace(/\/$/, '') || '/';

  if (bare === '/members' || bare === '/about') {
    const url = request.nextUrl.clone();
    url.pathname = bare === '/members' ? '/about-us' : '/story';
    return NextResponse.redirect(url, 308);
  }

  if (prefixed) {
    const url = request.nextUrl.clone();
    const rest = pathname.slice(prefixed[0].length);
    url.pathname = rest || '/';
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export default proxy;

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
