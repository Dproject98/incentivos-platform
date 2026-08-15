import { getLocale } from "next-intl/server"
import { LandingPage } from "@/components/landing/LandingPage"
import { prisma } from "@/lib/prisma"

export const revalidate = 60

export default async function Page() {
  const locale = await getLocale()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [reservationCounts, confirmedThisMonth, captadoresCount, paidThisWeekAgg] = await Promise.all([
    prisma.reservation.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.reservation.count({ where: { status: "CONFIRMED", createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: "CAPTADOR" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "CREDIT", createdAt: { gte: sevenDaysAgo } } }),
  ])

  const confirmed = reservationCounts.find((r) => r.status === "CONFIRMED")?._count.id ?? 0
  const total = reservationCounts.reduce((acc, r) => acc + r._count.id, 0)
  const conversionRate = total > 0 ? Math.round((confirmed / total) * 100) : 0
  const paidThisWeek = paidThisWeekAgg._sum.amount ?? 0

  return (
    <LandingPage
      locale={locale}
      confirmedThisMonth={confirmedThisMonth}
      captadoresCount={captadoresCount}
      conversionRate={conversionRate}
      paidThisWeek={paidThisWeek}
    />
  )
}
