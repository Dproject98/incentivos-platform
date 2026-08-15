import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyResetToken } from "@/lib/reset-token"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 })
  }

  const { token, password } = parsed.data
  const email = verifyResetToken(token)
  if (!email) {
    return NextResponse.json({ error: "invalid_or_expired_token" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { email }, data: { passwordHash } })

  return NextResponse.json({ ok: true })
}
