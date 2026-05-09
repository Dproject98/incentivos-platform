import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  const campaign = await prisma.campaign.findFirst({
    where: { id, businessId: business.id },
  })
  if (!campaign) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      status: body.status,
      title: body.title,
      description: body.description,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    },
  })

  return NextResponse.json(updated)
}
