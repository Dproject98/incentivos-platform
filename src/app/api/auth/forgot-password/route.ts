import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createResetToken } from "@/lib/reset-token"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  // 3 attempts per hour per IP — prevent email flooding
  const ip = getClientIp(req)
  if (!rateLimit(`forgot-pw:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ ok: true }) // silent 200 to avoid enumeration
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: true }) // silent 200

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  // Always return 200 — never reveal if an email exists
  if (!user) return NextResponse.json({ ok: true })

  const token = createResetToken(email)
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? ""
  const resetUrl = `${appUrl}/es/login/reset-password?token=${encodeURIComponent(token)}`

  try {
    await sendPasswordResetEmail(email, resetUrl)
  } catch (err) {
    console.error("[forgot-password] email failed:", err)
    // Still return 200 to not reveal email/error details
  }

  return NextResponse.json({ ok: true })
}
