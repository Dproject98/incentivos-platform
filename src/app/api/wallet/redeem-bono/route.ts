import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { campaignId } = await req.json()
  if (!campaignId) return NextResponse.json({ error: "campaign_required" }, { status: 400 })

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } })
  if (!wallet) return NextResponse.json({ error: "no_wallet" }, { status: 404 })

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { business: { select: { name: true } } },
  })

  if (!campaign || !campaign.incentiveTypes.includes("BONO") || campaign.status !== "ACTIVE") {
    return NextResponse.json({ error: "campaign_not_found" }, { status: 404 })
  }

  const minValue = campaign.bonusMinValue ?? 0
  if (wallet.balance < minValue) {
    return NextResponse.json({ error: "insufficient_balance", required: minValue }, { status: 400 })
  }

  // Check no pending redemption already exists for this wallet + campaign
  const existing = await prisma.bonoRedemption.findFirst({
    where: { walletId: wallet.id, campaignId, status: "PENDING" },
  })
  if (existing) {
    return NextResponse.json({ error: "already_pending" }, { status: 409 })
  }

  await prisma.$transaction(async (tx) => {
    // Deduct from wallet
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: minValue } },
    })

    // Record debit transaction
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: minValue,
        type: "DEBIT",
        description: `Canje bono: ${campaign.bonusDescription ?? campaign.title} — ${campaign.business.name}`,
      },
    })

    // Create pending redemption request
    await tx.bonoRedemption.create({
      data: { walletId: wallet.id, campaignId, amount: minValue },
    })
  })

  return NextResponse.json({ success: true })
}
