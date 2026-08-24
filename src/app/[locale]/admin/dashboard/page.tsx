import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { Users, Megaphone, CalendarCheck, Euro, ArrowLeftRight, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AdminCharts } from "@/components/admin/AdminCharts"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/es/login")

  const locale = await getLocale()

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalCaptadores,
    totalEmpresas,
    activeCampaigns,
    totalReservations,
    reservationsToday,
    confirmedCount,
    totalIncentives,
    recentTransactions,
    recentReservations,
    last30Reservations,
    last30Transactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CAPTADOR" } }),
    prisma.user.count({ where: { role: "EMPRESA" } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.reservation.count({ where: { status: "CONFIRMED" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "CREDIT" } }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { wallet: { include: { user: { select: { name: true } } } } },
    }),
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        campaign: { include: { business: { select: { name: true } } } },
        captador: { select: { name: true } },
      },
    }),
    // For charts: last 30 days of reservations
    prisma.reservation.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true },
    }),
    // For charts: last 30 days of credit transactions
    prisma.transaction.findMany({
      where: { type: "CREDIT", createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amount: true },
    }),
  ])

  const conversionRate = totalReservations > 0 ? Math.round((confirmedCount / totalReservations) * 100) : 0

  // Build daily series for charts (last 30 days)
  const dayMap: Record<string, { reservas: number; confirmadas: number; incentivos: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    dayMap[key] = { reservas: 0, confirmadas: 0, incentivos: 0 }
  }
  last30Reservations.forEach((r) => {
    const key = r.createdAt.toISOString().slice(0, 10)
    if (dayMap[key]) {
      dayMap[key].reservas++
      if (r.status === "CONFIRMED") dayMap[key].confirmadas++
    }
  })
  last30Transactions.forEach((t) => {
    const key = t.createdAt.toISOString().slice(0, 10)
    if (dayMap[key]) dayMap[key].incentivos = +(dayMap[key].incentivos + t.amount).toFixed(2)
  })
  const dailyChartData = Object.entries(dayMap).map(([date, v]) => ({ date, ...v }))
  const totalPaid = totalIncentives._sum.amount ?? 0

  const stats = [
    { label: "Usuarios totales",     value: totalUsers,                                       icon: Users,        color: "#E8735A" },
    { label: "Campañas activas",      value: activeCampaigns,                                  icon: Megaphone,    color: "#E8735A" },
    { label: "Reservas totales",      value: totalReservations,                                icon: CalendarCheck, color: "#E8735A" },
    { label: "Incentivos pagados",    value: `${totalPaid.toFixed(2)} €`,                      icon: Euro,         color: "#E8735A" },
    { label: "Tasa de conversión",    value: `${conversionRate}%`,                             icon: TrendingUp,   color: "#E8735A" },
    { label: "Reservas hoy",          value: reservationsToday,                                icon: CalendarCheck, color: "#E8735A" },
  ]

  const statusLabel: Record<string, string> = {
    PENDING:   "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    NO_SHOW:   "No show",
  }
  const statusColor: Record<string, string> = {
    PENDING:   "#D9B36C",
    CONFIRMED: "#E8735A",
    CANCELLED: "#dc2626",
    NO_SHOW:   "#AEB2B8",
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-1" style={{ color: "#93979E" }}>
          Panel de administración
        </p>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#F2F1EF", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          Vista general
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#93979E" }}>
          {totalCaptadores} captadores · {totalEmpresas} empresas
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl p-5"
              style={{ background: "#1E2023", border: "1px solid #34373C" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.1em] font-mono leading-tight" style={{ color: "#93979E" }}>
                  {s.label}
                </p>
                <Icon className="h-4 w-4 shrink-0" style={{ color: s.color, opacity: 0.6 }} />
              </div>
              <p
                className="font-semibold"
                style={{ fontFamily: "var(--font-display)", color: s.color, fontSize: "clamp(20px,2.5vw,28px)", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <AdminCharts dailyData={dailyChartData} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <div>
          <h2 className="font-semibold text-[15px] mb-3" style={{ color: "#F2F1EF" }}>Últimas reservas</h2>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
            {recentReservations.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: i > 0 ? "1px solid #34373C" : "none" }}
              >
                <div>
                  <p className="font-medium text-[13px]" style={{ color: "#F2F1EF" }}>{r.clientName}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#93979E" }}>
                    {r.campaign.business.name} · {r.captador.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-[11px] font-medium"
                    style={{ color: statusColor[r.status] ?? "#93979E" }}
                  >
                    {statusLabel[r.status] ?? r.status}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#93979E" }}>
                    {format(new Date(r.createdAt), "dd MMM HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {recentReservations.length === 0 && (
              <p className="px-4 py-6 text-[13px] text-center" style={{ color: "#93979E" }}>Sin reservas aún</p>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="font-semibold text-[15px] mb-3" style={{ color: "#F2F1EF" }}>Últimas transacciones</h2>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
            {recentTransactions.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: i > 0 ? "1px solid #34373C" : "none" }}
              >
                <div>
                  <p className="font-medium text-[13px]" style={{ color: "#F2F1EF" }}>{tx.wallet.user.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#93979E" }}>{tx.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="font-semibold text-[13px]"
                    style={{ color: tx.type === "CREDIT" ? "#E8735A" : "#dc2626" }}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}{tx.amount.toFixed(2)} €
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#93979E" }}>
                    {format(new Date(tx.createdAt), "dd MMM HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="px-4 py-6 text-[13px] text-center" style={{ color: "#93979E" }}>Sin transacciones aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
