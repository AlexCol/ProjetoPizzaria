import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token'); // Use o nome do seu cookie de autenticação
  console.log('MIDDLEWARE:', req.method, pathname);
  console.log('TOKEN:', token);

  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (token)
      return NextResponse.redirect(new URL('/', req.url));
  }

  if (!req.nextUrl.pathname.startsWith('/auth')) {
    if (!token)
      return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known).*)',
    '/api/:path*',
  ],
};