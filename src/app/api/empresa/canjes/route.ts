import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  const redemptions = await prisma.bonoRedemption.findMany({
    where: { campaign: { businessId: business.id } },
    include: {
      campaign: { select: { title: true, bonusDescription: true, bonusMinValue: true } },
      wallet: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(redemptions)
}
