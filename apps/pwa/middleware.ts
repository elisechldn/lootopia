import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MOBILE_UA_REGEX = /Android|iPhone|iPad|iPod|Mobile/i

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''

  /*if (!MOBILE_UA_REGEX.test(ua)) {
    return NextResponse.redirect(new URL('/not-mobile', request.url))
  }*/

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|not-mobile|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
}
