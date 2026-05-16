import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await params

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  // Verify the staff member belongs to this business
  const staff = await prisma.businessStaff.findUnique({ where: { id } })
  if (!staff || staff.businessId !== business.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  await prisma.businessStaff.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
