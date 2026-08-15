import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { Role } from "@prisma/client"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const captadorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  phone: z.string().max(20).optional(),
  role: z.literal("CAPTADOR"),
})

const empresaSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  phone: z.string().max(20).optional(),
  role: z.literal("EMPRESA"),
  businessName: z.string().min(2).max(100),
  businessType: z.string().min(2).max(50),
  businessAddress: z.string().max(200).optional(),
})

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per hour per IP
  const ip = getClientIp(req)
  if (!rateLimit(`register:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 })
  }

  try {
    const body = await req.json()
    const role: Role = body.role

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) {
      return NextResponse.json({ error: "email_taken" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(body.password, 12)

    if (role === "CAPTADOR") {
      const data = captadorSchema.parse(body)
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          phone: data.phone,
          role: "CAPTADOR",
        },
      })
      await prisma.wallet.create({ data: { userId: user.id } })
      return NextResponse.json({ success: true, userId: user.id })
    }

    if (role === "EMPRESA") {
      const data = empresaSchema.parse(body)
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          phone: data.phone,
          role: "EMPRESA",
          business: {
            create: {
              name: data.businessName,
              type: data.businessType,
              address: data.businessAddress,
            },
          },
        },
      })
      return NextResponse.json({ success: true, userId: user.id })
    }

    return NextResponse.json({ error: "invalid_role" }, { status: 400 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", issues: err.issues }, { status: 422 })
    }
    console.error("[register]", err)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
