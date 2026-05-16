import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

/** Generate a unique 4-digit PIN not already in use */
async function generateUniquePin(): Promise<string> {
  for (let attempts = 0; attempts < 20; attempts++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000))
    const exists = await prisma.businessStaff.findUnique({ where: { pin } })
    if (!exists) return pin
  }
  throw new Error("Could not generate a unique PIN")
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "no_business" }, { status: 404 })

  const { name, email } = await req.json()

  const pin = await generateUniquePin()

  const staff = await prisma.businessStaff.create({
    data: { businessId: business.id, name, email, pin },
  })

  return NextResponse.json(staff, { status: 201 })
}
