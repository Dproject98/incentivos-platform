import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Megaphone, CalendarCheck, TrendingUp, Euro, ArrowRight, QrCode } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

export default async function EmpresaDashboard() {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") redirect("/es/login")

  const locale = await getLocale()
  const t = await getTranslations("empresa.dashboard")
  const dateLocale = locale === "en" ? enUS : es

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) redirect(`/${locale}/empresa/dashboard`)

  const [campaigns, reservations] = await Promise.all([
    prisma.campaign.findMany({
      where: { businessId: business.id },
      include: { _count: { select: { reservations: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reservation.findMany({
      where: { campaign: { businessId: business.id } },
      include: { campaign: { select: { title: true, incentiveType: true, incentiveValue: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ])

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length
  const confirmedReservations = await prisma.reservation.count({
    where: { campaign: { businessId: business.id }, status: "CONFIRMED" },
  })
  const totalIncentives = await prisma.transaction.aggregate({
    where: { reservation: { campaign: { businessId: business.id } }, type: "CREDIT" },
    _sum: { amount: true },
  })

  const stats = [
    { label: t("active_campaigns"),     value: activeCampaigns,           icon: Megaphone,    color: "text-cyan-400",   bg: "bg-cyan-500/10 border-cyan-500/20",   glow: "shadow-glow-cyan" },
    { label: t("total_reservations"),   value: reservations.length,       icon: CalendarCheck, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", glow: "shadow-glow-purple" },
    { label: t("confirmed_reservations"), value: confirmedReservations,   icon: TrendingUp,   color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  glow: "" },
    { label: t("total_incentives"),     value: `${(totalIncentives._sum.amount ?? 0).toFixed(2)} €`, icon: Euro, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", glow: "shadow-glow-pink" },
  ]

  const statusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: "Pendiente",   cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    CONFIRMED: { label: "Confirmada",  cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    CANCELLED: { label: "Cancelada",   cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    NO_SHOW:   { label: "No presentó", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">Bienvenido, <span className="text-cyan-300">{business.name}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`glass rounded-2xl p-5 border ${s.bg} ${s.glow}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</span>
                <div className={`h-8 w-8 rounded-lg ${s.bg} border flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href={`/${locale}/empresa/campanas/nueva`} className="group">
          <div className="glass rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/40 transition-all hover:shadow-glow-cyan">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Nueva campaña</p>
                <p className="text-sm text-slate-400 mt-1">Crea una nueva campaña de captación</p>
              </div>
              <ArrowRight className="h-5 w-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
        <Link href={`/${locale}/empresa/staff`} className="group">
          <div className="glass rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/40 transition-all hover:shadow-glow-purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Gestionar staff</p>
                <p className="text-sm text-slate-400 mt-1">Personal autorizado para escanear QR</p>
              </div>
              <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">{t("recent_activity")}</h2>
        {reservations.length === 0 ? (
          <div className="glass rounded-2xl p-8 border border-white/5 text-center text-slate-500">
            Sin actividad reciente. ¡Crea tu primera campaña!
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const sc = statusConfig[r.status] ?? statusConfig.PENDING
              return (
                <div key={r.id} className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-sm">
                      {r.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{r.clientName}</p>
                      <p className="text-xs text-slate-500">
                        {r.campaign.title} · {format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })} · {r.time} · {r.guests} pax
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.status === "CONFIRMED" && r.campaign.incentiveType !== "BONO" && (
                      <span className="text-xs text-pink-400 font-medium">{r.campaign.incentiveValue}€</span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${sc.cls}`}>{sc.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
