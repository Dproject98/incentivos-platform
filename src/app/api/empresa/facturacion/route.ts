import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const [pendingReservations, payments] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        campaign: { businessId: business.id },
        status: "CONFIRMED",
        empresaPaid: false,
        empresaPaymentId: null,
        chosenIncentiveType: { in: ["FIXED", "PERCENTAGE"] },
      },
      include: {
        campaign: {
          select: { title: true, fixedValue: true, percentageValue: true, incentiveValue: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.empresaPayment.findMany({
      where: { businessId: business.id },
      include: { _count: { select: { reservations: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  const pending = pendingReservations.map((r) => {
    const amount = r.chosenIncentiveType === "FIXED"
      ? (r.campaign.fixedValue ?? r.campaign.incentiveValue)
      : (r.campaign.percentageValue ?? r.campaign.incentiveValue)
    return {
      id: r.id,
      clientName: r.clientName,
      date: r.date,
      campaignTitle: r.campaign.title,
      incentiveAmount: amount,
      chosenIncentiveType: r.chosenIncentiveType,
    }
  })

  const total = pending.reduce((s, r) => s + (r.chosenIncentiveType === "FIXED" ? r.incentiveAmount : 0), 0)

  const paymentsOut = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    reference: p.confirmedAt ? p.reference ?? "" : `__pending_${p.id}`,
    createdAt: p.createdAt,
    reservationCount: p._count.reservations,
  }))

  return NextResponse.json({ pending, total, payments: paymentsOut })
}
