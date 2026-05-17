import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { cashIncentiveAmount } from "@/lib/incentive"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await params

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      campaign: { select: { businessId: true, incentiveTypes: true, incentiveValue: true, fixedValue: true, percentageValue: true, business: { select: { name: true } } } },
      captador: { include: { wallet: true } },
    },
  })

  if (!reservation || reservation.campaign.businessId !== business.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (reservation.status === "CONFIRMED") {
    return NextResponse.json({ error: "already_confirmed" }, { status: 409 })
  }

  const incentiveAmount = cashIncentiveAmount(reservation.campaign, reservation.chosenIncentiveType)

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id },
      data: { status: "CONFIRMED", qrScannedAt: new Date(), incentivePaid: true },
    })

    if (incentiveAmount > 0 && reservation.captador.wallet) {
      await tx.wallet.update({
        where: { id: reservation.captador.wallet.id },
        data: { balance: { increment: incentiveAmount } },
      })
      await tx.transaction.create({
        data: {
          walletId: reservation.captador.wallet.id,
          amount: incentiveAmount,
          type: "CREDIT",
          description: `Incentivo: ${reservation.campaign.business.name}`,
          reservationId: id,
        },
      })
    }
  })

  return NextResponse.json({ success: true })
}
