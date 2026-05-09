import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { qrToken: token },
    include: {
      campaign: { include: { business: { select: { name: true, type: true } } } },
    },
  })

  if (!reservation) {
    return NextResponse.json({ error: "invalid_qr" }, { status: 404 })
  }

  return NextResponse.json({
    id: reservation.id,
    clientName: reservation.clientName,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    status: reservation.status,
    qrScannedAt: reservation.qrScannedAt,
    businessName: reservation.campaign.business.name,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { token } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { qrToken: token },
    include: {
      campaign: {
        include: { business: { select: { name: true } } },
      },
      captador: { include: { wallet: true } },
    },
  })

  if (!reservation) {
    return NextResponse.json({ error: "invalid_qr" }, { status: 404 })
  }

  if (reservation.status === "CONFIRMED") {
    return NextResponse.json({ error: "already_scanned", reservation }, { status: 409 })
  }

  const incentiveAmount = reservation.campaign.incentiveType === "BONO"
    ? 0
    : reservation.campaign.incentiveValue

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CONFIRMED",
        qrScannedAt: new Date(),
        incentivePaid: true,
        staffScan: {
          create: { staffId: session.user.id },
        },
      },
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
          reservationId: reservation.id,
        },
      })
    }
  })

  return NextResponse.json({ success: true, incentiveAmount })
}
