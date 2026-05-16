import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
    businessId: reservation.campaign.businessId,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const pin: string | undefined = body?.pin

  if (!pin) {
    return NextResponse.json({ error: "pin_required" }, { status: 400 })
  }

  // Find reservation
  const reservation = await prisma.reservation.findUnique({
    where: { qrToken: token },
    include: {
      campaign: {
        include: { business: { select: { name: true, id: true } } },
      },
      captador: { include: { wallet: true } },
    },
  })

  if (!reservation) {
    return NextResponse.json({ error: "invalid_qr" }, { status: 404 })
  }

  if (reservation.status === "CONFIRMED") {
    return NextResponse.json({ error: "already_scanned" }, { status: 409 })
  }

  // Validate PIN — find the staff member with this PIN
  const staffMember = await prisma.businessStaff.findUnique({
    where: { pin },
  })

  if (!staffMember) {
    return NextResponse.json({ error: "wrong_pin" }, { status: 403 })
  }

  // Verify the staff belongs to the same business as the campaign
  if (staffMember.businessId !== reservation.campaign.businessId) {
    return NextResponse.json({ error: "wrong_pin" }, { status: 403 })
  }

  // All checks pass — confirm the reservation
  const incentiveAmount =
    reservation.campaign.incentiveType === "BONO"
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
          create: { businessStaffId: staffMember.id },
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

  return NextResponse.json({ success: true, incentiveAmount, staffName: staffMember.name })
}
