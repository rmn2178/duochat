import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionJwt } from '@/lib/auth';

/**
 * Proxy (formerly middleware) runs on every matched request.
 * - Protects /chat and /api/* routes (except /api/auth/login)
 * - Redirects authenticated users away from /login
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('duo_session')?.value;

  // Verify the session JWT
  let isAuthenticated = false;
  if (sessionToken) {
    const payload = await verifySessionJwt(sessionToken);
    isAuthenticated = !!payload?.sub;
  }

  // Protected routes: /chat and /api/* (except /api/auth/login)
  const isProtectedRoute =
    pathname.startsWith('/chat') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth/login'));

  if (isProtectedRoute && !isAuthenticated) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from /login
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Redirect root to /chat or /login
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(
      new URL(isAuthenticated ? '/chat' : '/login', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
