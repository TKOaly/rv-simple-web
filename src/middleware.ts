import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hasAccessToken = request.cookies.has("accessToken");
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next()
  }
  if (!hasAccessToken) {
    return NextResponse.redirect(new URL("/login" + (request.nextUrl.pathname !== "/" ? "?redir=" + request.nextUrl.pathname : ""), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}