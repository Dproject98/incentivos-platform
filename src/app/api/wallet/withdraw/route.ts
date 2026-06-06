import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createPayout } from "@/lib/stripe"
import { z } from "zod"

const withdrawSchema = z.object({
  amount: z.number().positive("El importe debe ser mayor que 0").max(10_000, "Máximo 10.000 € por retirada"),
  method: z.enum(["stripe", "bono"]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // Validate input
  const body = await req.json().catch(() => ({}))
  const parsed = withdrawSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 })
  }
  const { amount, method } = parsed.data

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } })
  if (!wallet) return NextResponse.json({ error: "no_wallet" }, { status: 404 })

  if (wallet.balance < amount) {
    return NextResponse.json({ error: "insufficient_balance" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  // 1. Deduct balance in DB first (inside transaction)
  await prisma.$transaction(async (tx) => {
    // Re-check balance inside transaction to prevent race conditions
    const freshWallet = await tx.wallet.findUnique({ where: { id: wallet.id } })
    if (!freshWallet || freshWallet.balance < amount) {
      throw new Error("insufficient_balance")
    }

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

  // 2. Trigger external Stripe payout AFTER DB is committed
  //    If this fails, the DEBIT is recorded and an admin can manually retry
  if (method === "stripe") {
    if (!user?.stripeAccountId) {
      return NextResponse.json({ error: "no_stripe_account" }, { status: 400 })
    }
    try {
      await createPayout(amount, user.stripeAccountId, "Retiro de incentivos")
    } catch (err) {
      console.error("[withdraw] Stripe payout failed after DB debit — manual intervention required:", err)
      // The DEBIT transaction is already recorded; return error so client can retry
      // Admin can see the DEBIT in the admin panel to reconcile manually
      return NextResponse.json({ error: "payout_failed" }, { status: 502 })
    }
  }

  return NextResponse.json({ success: true })
}
