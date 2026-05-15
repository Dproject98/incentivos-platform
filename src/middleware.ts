import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import { NextResponse, type NextRequest } from "next/server"

// NOTE: We do NOT import next-auth here because next-auth's dependency `jose`
// uses DecompressionStream which is not available in Vercel's Edge Runtime.
// The actual JWT validation happens server-side in API routes / Server Components.
// This middleware only checks cookie presence to redirect unauthenticated users.

const intlMiddleware = createMiddleware(routing)

const protectedPrefixes = ["/es/captador", "/en/captador", "/es/empresa", "/en/empresa"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (isProtected) {
    // NextAuth v5 session cookie names (covers dev + production HTTPS)
    const hasSession =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("__Secure-authjs.session-token") ||
      req.cookies.has("next-auth.session-token") ||
      req.cookies.has("__Secure-next-auth.session-token")

    if (!hasSession) {
      const locale = pathname.startsWith("/en") ? "en" : "es"
      return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
