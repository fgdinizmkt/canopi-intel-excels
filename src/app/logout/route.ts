import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));

  response.cookies.set('canopi_auth', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax',
  });

  response.cookies.delete('canopi_auth');

  return response;
}
