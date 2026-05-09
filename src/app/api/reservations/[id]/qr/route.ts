import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateQRBuffer } from "@/lib/qr"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { id } = await params

  const reservation = await prisma.reservation.findUnique({ where: { id } })
  if (!reservation) return NextResponse.json({ error: "not_found" }, { status: 404 })

  if (session.user.role === "CAPTADOR" && reservation.captadorId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const buffer = await generateQRBuffer(reservation.qrToken)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-reserva-${id}.png"`,
    },
  })
}
