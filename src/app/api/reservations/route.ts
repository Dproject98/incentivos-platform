import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendReservationEmail } from "@/lib/email"
import { sendReservationWhatsApp } from "@/lib/whatsapp"
import { z } from "zod"

const createSchema = z.object({
  campaignId: z.string(),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(6),
  date: z.string(),
  time: z.string(),
  guests: z.number().int().min(1),
  notes: z.string().optional(),
  chosenIncentiveType: z.enum(["FIXED", "PERCENTAGE", "BONO"]).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  if (session.user.role === "CAPTADOR") {
    const reservations = await prisma.reservation.findMany({
      where: { captadorId: session.user.id },
      include: { campaign: { include: { business: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(reservations)
  }

  if (session.user.role === "EMPRESA") {
    const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
    if (!business) return NextResponse.json([])

    const reservations = await prisma.reservation.findMany({
      where: { campaign: { businessId: business.id } },
      include: {
        campaign: { select: { title: true, incentiveTypes: true, incentiveValue: true } },
        captador: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(reservations)
  }

  return NextResponse.json({ error: "forbidden" }, { status: 403 })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const data = createSchema.parse(body)

  const campaign = await prisma.campaign.findUnique({
    where: { id: data.campaignId, status: "ACTIVE" },
    include: { business: { select: { name: true } } },
  })
  if (!campaign) return NextResponse.json({ error: "campaign_not_found" }, { status: 404 })

  // Determine which compensation the captador receives.
  let chosenIncentiveType = data.chosenIncentiveType
  if (chosenIncentiveType) {
    if (!campaign.incentiveTypes.includes(chosenIncentiveType)) {
      return NextResponse.json({ error: "invalid_incentive_type" }, { status: 400 })
    }
  } else if (campaign.incentiveTypes.length === 1) {
    chosenIncentiveType = campaign.incentiveTypes[0] as "FIXED" | "PERCENTAGE" | "BONO"
  } else {
    return NextResponse.json({ error: "incentive_type_required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  const reservation = await prisma.reservation.create({
    data: {
      campaignId: data.campaignId,
      captadorId: session.user.id,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      date: new Date(data.date),
      time: data.time,
      guests: data.guests,
      notes: data.notes,
      chosenIncentiveType,
    },
  })

  const dateStr = new Date(data.date).toLocaleDateString(
    user?.language === "en" ? "en-GB" : "es-ES",
    { day: "2-digit", month: "long", year: "numeric" }
  )

  const emailPayload = {
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    businessName: campaign.business.name,
    date: dateStr,
    time: data.time,
    guests: data.guests,
    qrToken: reservation.qrToken,
    language: user?.language,
  }

  await Promise.allSettled([
    sendReservationEmail(emailPayload),
    sendReservationWhatsApp({
      ...emailPayload,
      clientPhone: data.clientPhone,
    }),
  ])

  return NextResponse.json(reservation, { status: 201 })
}
