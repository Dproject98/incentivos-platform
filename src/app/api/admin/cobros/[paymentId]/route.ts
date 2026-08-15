import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { paymentId } = await params
  const body = await req.json().catch(() => ({}))
  const action: "confirm" | "reject" = body.action ?? "confirm"

  const payment = await prisma.empresaPayment.findUnique({
    where: { id: paymentId },
    include: { reservations: { select: { id: true } } },
  })

  if (!payment) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (payment.confirmedAt) return NextResponse.json({ error: "already_processed" }, { status: 409 })

  if (action === "confirm") {
    await prisma.$transaction(async (tx) => {
      // Mark payment as confirmed
      await tx.empresaPayment.update({
        where: { id: paymentId },
        data: { confirmedAt: new Date(), confirmedBy: session.user.id, notes: body.notes ?? null },
      })
      // Mark all linked reservations as empresa paid
      await tx.reservation.updateMany({
        where: { empresaPaymentId: paymentId },
        data: { empresaPaid: true, empresaPaidAt: new Date() },
      })
    })
    return NextResponse.json({ success: true, action: "confirmed" })
  }

  if (action === "reject") {
    await prisma.$transaction(async (tx) => {
      // Unlink reservations (leave them as pending again)
      await tx.reservation.updateMany({
        where: { empresaPaymentId: paymentId },
        data: { empresaPaymentId: null },
      })
      await tx.empresaPayment.delete({ where: { id: paymentId } })
    })
    return NextResponse.json({ success: true, action: "rejected" })
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 })
}
