import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { Users, Megaphone, CalendarCheck, Euro, ArrowLeftRight, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/es/login")

  const locale = await getLocale()

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

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
  ])

  const conversionRate = totalReservations > 0 ? Math.round((confirmedCount / totalReservations) * 100) : 0
  const totalPaid = totalIncentives._sum.amount ?? 0

  const stats = [
    { label: "Usuarios totales",     value: totalUsers,                                       icon: Users,        color: "#1F6B4D" },
    { label: "Campañas activas",      value: activeCampaigns,                                  icon: Megaphone,    color: "#D88B2E" },
    { label: "Reservas totales",      value: totalReservations,                                icon: CalendarCheck, color: "#1F6B4D" },
    { label: "Incentivos pagados",    value: `${totalPaid.toFixed(2)} €`,                      icon: Euro,         color: "#D88B2E" },
    { label: "Tasa de conversión",    value: `${conversionRate}%`,                             icon: TrendingUp,   color: "#1F6B4D" },
    { label: "Reservas hoy",          value: reservationsToday,                                icon: CalendarCheck, color: "#D88B2E" },
  ]

  const statusLabel: Record<string, string> = {
    PENDING:   "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    NO_SHOW:   "No show",
  }
  const statusColor: Record<string, string> = {
    PENDING:   "#B5710D",
    CONFIRMED: "#1F6B4D",
    CANCELLED: "#dc2626",
    NO_SHOW:   "#2A3B34",
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-1" style={{ color: "#88B5A2" }}>
          Panel de administración
        </p>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          Vista general
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>
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
              style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.1em] font-mono leading-tight" style={{ color: "#88B5A2" }}>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <div>
          <h2 className="font-semibold text-[15px] mb-3" style={{ color: "#0F1F1A" }}>Últimas reservas</h2>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
            {recentReservations.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: i > 0 ? "1px solid rgba(15,31,26,0.05)" : "none" }}
              >
                <div>
                  <p className="font-medium text-[13px]" style={{ color: "#0F1F1A" }}>{r.clientName}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#88B5A2" }}>
                    {r.campaign.business.name} · {r.captador.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-[11px] font-medium"
                    style={{ color: statusColor[r.status] ?? "#88B5A2" }}
                  >
                    {statusLabel[r.status] ?? r.status}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#88B5A2" }}>
                    {format(new Date(r.createdAt), "dd MMM HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {recentReservations.length === 0 && (
              <p className="px-4 py-6 text-[13px] text-center" style={{ color: "#88B5A2" }}>Sin reservas aún</p>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="font-semibold text-[15px] mb-3" style={{ color: "#0F1F1A" }}>Últimas transacciones</h2>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
            {recentTransactions.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: i > 0 ? "1px solid rgba(15,31,26,0.05)" : "none" }}
              >
                <div>
                  <p className="font-medium text-[13px]" style={{ color: "#0F1F1A" }}>{tx.wallet.user.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#88B5A2" }}>{tx.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="font-semibold text-[13px]"
                    style={{ color: tx.type === "CREDIT" ? "#1F6B4D" : "#dc2626" }}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}{tx.amount.toFixed(2)} €
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#88B5A2" }}>
                    {format(new Date(tx.createdAt), "dd MMM HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="px-4 py-6 text-[13px] text-center" style={{ color: "#88B5A2" }}>Sin transacciones aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
