import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await params
  const { action, notes } = await req.json() // action: "approve" | "reject"

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  const redemption = await prisma.bonoRedemption.findUnique({
    where: { id },
    include: { campaign: { select: { businessId: true } } },
  })

  if (!redemption || redemption.campaign.businessId !== business.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (redemption.status !== "PENDING") {
    return NextResponse.json({ error: "already_resolved" }, { status: 409 })
  }

  if (action === "approve") {
    await prisma.bonoRedemption.update({
      where: { id },
      data: { status: "APPROVED", notes: notes ?? null, updatedAt: new Date() },
    })
    return NextResponse.json({ success: true, status: "APPROVED" })
  }

  if (action === "reject") {
    // Refund wallet balance
    await prisma.$transaction(async (tx) => {
      await tx.bonoRedemption.update({
        where: { id },
        data: { status: "REJECTED", notes: notes ?? null, updatedAt: new Date() },
      })
      await tx.wallet.update({
        where: { id: redemption.walletId },
        data: { balance: { increment: redemption.amount } },
      })
      await tx.transaction.create({
        data: {
          walletId: redemption.walletId,
          amount: redemption.amount,
          type: "CREDIT",
          description: `Reembolso canje rechazado`,
        },
      })
    })
    return NextResponse.json({ success: true, status: "REJECTED" })
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 })
}
