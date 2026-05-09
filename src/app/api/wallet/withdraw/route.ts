import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createPayout } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { amount, method } = await req.json()

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } })
  if (!wallet) return NextResponse.json({ error: "no_wallet" }, { status: 404 })

  if (wallet.balance < amount) {
    return NextResponse.json({ error: "insufficient_balance" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  if (method === "stripe") {
    if (!user?.stripeAccountId) {
      return NextResponse.json({ error: "no_stripe_account" }, { status: 400 })
    }
    await createPayout(amount, user.stripeAccountId, "Retiro de incentivos")
  }

  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    })
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: "DEBIT",
        description: method === "stripe" ? "Transferencia bancaria" : "Bono solicitado",
      },
    })
  })

  return NextResponse.json({ success: true })
}
