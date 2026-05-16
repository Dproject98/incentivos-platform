import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
      bonoRedemptions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          campaign: {
            select: { title: true, bonusDescription: true, bonusMinValue: true, business: { select: { name: true } } },
          },
        },
      },
    },
  })

  // Available BONO campaigns (active, with minValue set)
  const availableBonos = await prisma.campaign.findMany({
    where: { status: "ACTIVE", incentiveType: "BONO", bonusMinValue: { not: null } },
    select: {
      id: true,
      title: true,
      bonusDescription: true,
      bonusMinValue: true,
      business: { select: { name: true, type: true } },
    },
    orderBy: { bonusMinValue: "asc" },
  })

  return NextResponse.json({
    balance: wallet?.balance ?? 0,
    transactions: wallet?.transactions ?? [],
    stripeConnected: !!user?.stripeAccountId,
    availableBonos,
    pendingRedemptions: wallet?.bonoRedemptions ?? [],
  })
}
