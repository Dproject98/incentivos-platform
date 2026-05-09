import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { Role } from "@prisma/client"

const captadorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.literal("CAPTADOR"),
})

const empresaSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.literal("EMPRESA"),
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  businessAddress: z.string().optional(),
})

export async function POST(req: NextRequest) {
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
    console.error(err)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
