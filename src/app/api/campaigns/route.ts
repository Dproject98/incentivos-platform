import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  incentiveTypes: z.array(z.enum(["FIXED", "PERCENTAGE", "BONO"])).min(1),
  fixedValue: z.number().min(0).optional(),
  percentageValue: z.number().min(0).optional(),
  bonusDescription: z.string().optional(),
  bonusMinValue: z.number().positive().optional(),
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
  try {
    const session = await auth()
    if (!session || session.user.role !== "EMPRESA") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })
    if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

    const body = await req.json()
    console.log("[campaigns POST] body recibido:", JSON.stringify(body))

    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      console.error("[campaigns POST] Zod error:", JSON.stringify(parsed.error.issues))
      return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 400 })
    }
    const data = parsed.data

    // Business rule: every selected incentive type must have its value(s).
    const issues: { path: string[]; message: string }[] = []
    if (data.incentiveTypes.includes("FIXED") && (data.fixedValue == null || data.fixedValue <= 0)) {
      issues.push({ path: ["fixedValue"], message: "El valor fijo (€) es obligatorio y debe ser mayor que 0" })
    }
    if (data.incentiveTypes.includes("PERCENTAGE") && (data.percentageValue == null || data.percentageValue <= 0)) {
      issues.push({ path: ["percentageValue"], message: "El porcentaje (%) es obligatorio y debe ser mayor que 0" })
    }
    if (data.incentiveTypes.includes("BONO")) {
      if (!data.bonusDescription) issues.push({ path: ["bonusDescription"], message: "La descripción del bono es obligatoria" })
      if (data.bonusMinValue == null || data.bonusMinValue <= 0) {
        issues.push({ path: ["bonusMinValue"], message: "El valor mínimo de canje es obligatorio y debe ser mayor que 0" })
      }
    }
    if (issues.length > 0) {
      return NextResponse.json({ error: "validation_error", issues }, { status: 400 })
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        incentiveTypes: data.incentiveTypes,
        fixedValue: data.incentiveTypes.includes("FIXED") ? data.fixedValue : null,
        percentageValue: data.incentiveTypes.includes("PERCENTAGE") ? data.percentageValue : null,
        bonusDescription: data.incentiveTypes.includes("BONO") ? data.bonusDescription : null,
        bonusMinValue: data.incentiveTypes.includes("BONO") ? data.bonusMinValue : null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        maxReservations: data.maxReservations,
        businessId: business.id,
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (err) {
    console.error("[campaigns POST] error:", err)
    return NextResponse.json({ error: "server_error", detail: String(err) }, { status: 500 })
  }
}
