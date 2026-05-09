import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createConnectedAccount, createAccountLink } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 })

  let stripeAccountId = user.stripeAccountId

  if (!stripeAccountId) {
    const account = await createConnectedAccount(user.email)
    stripeAccountId = account.id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeAccountId },
    })
  }

  const accountLink = await createAccountLink(stripeAccountId)
  return NextResponse.json({ url: accountLink.url })
}
