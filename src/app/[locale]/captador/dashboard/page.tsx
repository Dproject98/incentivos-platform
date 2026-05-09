import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Megaphone, CalendarCheck, Wallet, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

export default async function CaptadorDashboard() {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") redirect("/es/login")

  const locale = await getLocale()
  const t = await getTranslations("captador.dashboard")
  const tRes = await getTranslations("captador.reservations")
  const dateLocale = locale === "en" ? enUS : es

  const [wallet, reservations, activeCampaigns, confirmedCount] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId: session.user.id } }),
    prisma.reservation.findMany({
      where: { captadorId: session.user.id },
      include: { campaign: { include: { business: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.reservation.count({ where: { captadorId: session.user.id, status: "CONFIRMED" } }),
  ])

  const stats = [
    {
      label: t("active_campaigns"), value: activeCampaigns, icon: Megaphone,
      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", glow: "shadow-glow-purple",
    },
    {
      label: t("my_reservations"), value: reservations.length, icon: CalendarCheck,
      color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", glow: "shadow-glow-cyan",
    },
    {
      label: t("confirmed"), value: confirmedCount, icon: TrendingUp,
      color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", glow: "",
    },
    {
      label: t("balance"), value: `${wallet?.balance.toFixed(2) ?? "0.00"} €`, icon: Wallet,
      color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", glow: "shadow-glow-pink",
    },
  ]

  const statusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: tRes("status_pending"),   cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    CONFIRMED: { label: tRes("status_confirmed"), cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    CANCELLED: { label: tRes("status_cancelled"), cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    NO_SHOW:   { label: tRes("status_no_show"),   cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">Bienvenido de nuevo, <span className="text-purple-300">{session.user.name}</span></p>
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
        <Link href={`/${locale}/captador/campanas`} className="group">
          <div className="glass rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/40 transition-all hover:shadow-glow-purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Ver campañas</p>
                <p className="text-sm text-slate-400 mt-1">{activeCampaigns} campañas activas disponibles</p>
              </div>
              <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
        <Link href={`/${locale}/captador/wallet`} className="group">
          <div className="glass rounded-2xl p-5 border border-pink-500/20 hover:border-pink-400/40 transition-all hover:shadow-glow-pink">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Mi wallet</p>
                <p className="text-sm text-slate-400 mt-1">Saldo: <span className="text-pink-300">{wallet?.balance.toFixed(2) ?? "0.00"} €</span></p>
              </div>
              <ArrowRight className="h-5 w-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">{t("recent")}</h2>
        {reservations.length === 0 ? (
          <div className="glass rounded-2xl p-8 border border-white/5 text-center text-slate-500">
            Sin actividad reciente. ¡Explora las campañas disponibles!
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const sc = statusConfig[r.status] ?? statusConfig.PENDING
              return (
                <Link
                  key={r.id}
                  href={`/${locale}/captador/reservas/${r.id}`}
                  className="flex items-center justify-between p-4 glass rounded-xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/3 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                      {r.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{r.clientName}</p>
                      <p className="text-xs text-slate-500">{r.campaign.business.name} · {format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })} · {r.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${sc.cls}`}>{sc.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
