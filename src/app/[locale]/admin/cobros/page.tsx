import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { AdminCobrosClient } from "./AdminCobrosClient"

export default async function AdminCobrosPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/es/login")
  const locale = await getLocale()

  const payments = await prisma.empresaPayment.findMany({
    where: { confirmedAt: null },
    include: {
      business: { select: { name: true, type: true } },
      reservations: {
        select: {
          id: true, clientName: true, date: true,
          campaign: { select: { title: true, fixedValue: true, percentageValue: true, incentiveValue: true } },
          chosenIncentiveType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const confirmed = await prisma.empresaPayment.findMany({
    where: { confirmedAt: { not: null } },
    include: { business: { select: { name: true } } },
    orderBy: { confirmedAt: "desc" },
    take: 10,
  })

  // Also compute total owed per business (all time, unpaid)
  const totalOwed = await prisma.reservation.groupBy({
    by: [],
    where: { status: "CONFIRMED", empresaPaid: false },
    _count: { id: true },
  })

  return <AdminCobrosClient locale={locale} payments={payments as any} confirmed={confirmed as any} />
}
