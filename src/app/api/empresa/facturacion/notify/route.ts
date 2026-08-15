import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  reference: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 })
  }

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "not_found" }, { status: 404 })

  // Get all unpaid confirmed reservations for this business
  const pending = await prisma.reservation.findMany({
    where: {
      campaign: { businessId: business.id },
      status: "CONFIRMED",
      empresaPaid: false,
      chosenIncentiveType: { in: ["FIXED", "PERCENTAGE"] },
    },
    include: {
      campaign: { select: { fixedValue: true, percentageValue: true, incentiveValue: true } },
    },
  })

  if (pending.length === 0) {
    return NextResponse.json({ error: "no_pending" }, { status: 400 })
  }

  // Calculate total
  const total = pending.reduce((sum, r) => {
    const v = r.chosenIncentiveType === "FIXED"
      ? (r.campaign.fixedValue ?? r.campaign.incentiveValue)
      : (r.campaign.percentageValue ?? r.campaign.incentiveValue)
    return sum + v
  }, 0)

  // Create payment record (pending confirmation by admin)
  const payment = await prisma.empresaPayment.create({
    data: {
      businessId: business.id,
      amount: total,
      reference: parsed.data.reference,
      reservations: { connect: pending.map((r) => ({ id: r.id })) },
    },
  })

  // Send email to admin if Resend is configured
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: "Incentis <noreply@incentis.app>",
      to: process.env.ADMIN_EMAIL ?? "admin@incentis.app",
      subject: `💰 Pago notificado — ${business.name} (${total.toFixed(2)}€)`,
      html: `
        <p><strong>${business.name}</strong> ha notificado una transferencia bancaria.</p>
        <ul>
          <li>Importe: <strong>${total.toFixed(2)} €</strong></li>
          <li>Referencia: <strong>${parsed.data.reference}</strong></li>
          <li>Reservas incluidas: <strong>${pending.length}</strong></li>
          <li>ID de pago: <code>${payment.id}</code></li>
        </ul>
        <p>Confirma el pago en el panel de administración: <a href="${process.env.NEXT_PUBLIC_APP_URL}/es/admin/cobros">Admin → Cobros</a></p>
      `,
    })
  } catch {
    // Resend not configured — notification is just skipped, payment is still recorded
  }

  return NextResponse.json({ success: true, paymentId: payment.id, total, count: pending.length })
}
