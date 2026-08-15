import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "ENDED"]).optional(),
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  endDate: z.string().datetime().optional().nullable(),
}).strict()

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await params

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 })

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.issues }, { status: 422 })
  }

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  const campaign = await prisma.campaign.findFirst({
    where: { id, businessId: business.id },
  })
  if (!campaign) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const { status, title, description, endDate } = parsed.data
  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
  })

  return NextResponse.json(updated)
}
