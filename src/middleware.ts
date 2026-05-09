import createMiddleware from "next-intl/middleware"
import { auth } from "@/lib/auth"
import { routing } from "@/i18n/routing"
import { NextResponse } from "next/server"

const intlMiddleware = createMiddleware(routing)

const protectedPrefixes = ["/es/captador", "/en/captador", "/es/empresa", "/en/empresa"]

export default auth((req) => {
  const session = req.auth
  const pathname = req.nextUrl.pathname
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (isProtected && !session) {
    const locale = pathname.startsWith("/en") ? "en" : "es"
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl))
  }

  return intlMiddleware(req as any)
})

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
