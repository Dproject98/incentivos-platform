import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cashIncentiveAmount } from "@/lib/incentive"

// ── In-memory PIN brute-force protection ─────────────────────────────────────
// Per-token attempt counter with 5-minute window.
// Resets on server restart (acceptable for single-instance home server).
// For multi-instance deployments, replace with Redis.
const pinAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_PIN_ATTEMPTS = 10
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

function checkRateLimit(token: string): boolean {
  const now = Date.now()
  const entry = pinAttempts.get(token)

  if (!entry || now > entry.resetAt) {
    pinAttempts.set(token, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS })
    return true // allowed
  }

  if (entry.count >= MAX_PIN_ATTEMPTS) return false // blocked

  entry.count++
  return true // allowed
}

function resetAttempts(token: string) {
  pinAttempts.delete(token)
}
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { qrToken: token },
    include: {
      campaign: { include: { business: { select: { name: true, type: true } } } },
    },
  })

  if (!reservation) {
    return NextResponse.json({ error: "invalid_qr" }, { status: 404 })
  }

  // Do not expose sensitive fields (email, phone, captador info)
  return NextResponse.json({
    id: reservation.id,
    clientName: reservation.clientName,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    status: reservation.status,
    qrScannedAt: reservation.qrScannedAt,
    businessName: reservation.campaign.business.name,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const pin: string | undefined = body?.pin

  if (!pin) {
    return NextResponse.json({ error: "pin_required" }, { status: 400 })
  }

  // Rate limit: max 10 PIN attempts per QR token in 5 minutes
  if (!checkRateLimit(token)) {
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 })
  }

  // Find reservation
  const reservation = await prisma.reservation.findUnique({
    where: { qrToken: token },
    include: {
      campaign: {
        include: { business: { select: { name: true, id: true } } },
      },
      captador: { include: { wallet: true } },
    },
  })

  if (!reservation) {
    return NextResponse.json({ error: "invalid_qr" }, { status: 404 })
  }

  if (reservation.status === "CONFIRMED") {
    return NextResponse.json({ error: "already_scanned" }, { status: 409 })
  }

  // Validate PIN — find the staff member with this PIN
  const staffMember = await prisma.businessStaff.findUnique({ where: { pin } })

  if (!staffMember || staffMember.businessId !== reservation.campaign.businessId) {
    return NextResponse.json({ error: "wrong_pin" }, { status: 403 })
  }

  // All checks pass — reset attempt counter and confirm atomically
  resetAttempts(token)

  const incentiveAmount = cashIncentiveAmount(reservation.campaign, reservation.chosenIncentiveType)

  // Atomic confirmation: updateMany with status filter prevents double-confirmation
  // even under concurrent requests (race condition fix)
  const updated = await prisma.reservation.updateMany({
    where: { id: reservation.id, status: { not: "CONFIRMED" } },
    data: { status: "CONFIRMED", qrScannedAt: new Date(), incentivePaid: true },
  })

  if (updated.count === 0) {
    // Another request already confirmed it
    return NextResponse.json({ error: "already_scanned" }, { status: 409 })
  }

  // Record scan + credit wallet inside a transaction
  await prisma.$transaction(async (tx) => {
    await tx.staffScan.create({
      data: { reservationId: reservation.id, businessStaffId: staffMember.id },
    })

    if (incentiveAmount > 0 && reservation.captador.wallet) {
      await tx.wallet.update({
        where: { id: reservation.captador.wallet.id },
        data: { balance: { increment: incentiveAmount } },
      })
      await tx.transaction.create({
        data: {
          walletId: reservation.captador.wallet.id,
          amount: incentiveAmount,
          type: "CREDIT",
          description: `Incentivo: ${reservation.campaign.business.name}`,
          reservationId: reservation.id,
        },
      })
    }
  })

  return NextResponse.json({ success: true, incentiveAmount, staffName: staffMember.name })
}
