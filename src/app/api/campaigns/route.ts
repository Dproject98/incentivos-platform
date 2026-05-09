import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  incentiveType: z.enum(["FIXED", "PERCENTAGE", "BONO"]),
  incentiveValue: z.number().positive(),
  bonusDescription: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  maxReservations: z.number().int().positive().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  if (session.user.role === "CAPTADOR") {
    const campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: { business: { select: { name: true, type: true, address: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(campaigns)
  }

  if (session.user.role === "EMPRESA") {
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })
    if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

    const campaigns = await prisma.campaign.findMany({
      where: { businessId: business.id },
      include: {
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(campaigns)
  }

  return NextResponse.json({ error: "forbidden" }, { status: 403 })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
  })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  const body = await req.json()
  const data = createSchema.parse(body)

  const campaign = await prisma.campaign.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      businessId: business.id,
    },
  })

  return NextResponse.json(campaign, { status: 201 })
}
