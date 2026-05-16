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
    { label: t("active_campaigns"), value: activeCampaigns,                              icon: Megaphone,    color: "#1F6B4D" },
    { label: t("my_reservations"),  value: reservations.length,                          icon: CalendarCheck, color: "#D88B2E" },
    { label: t("confirmed"),        value: confirmedCount,                               icon: TrendingUp,   color: "#1F6B4D" },
    { label: t("balance"),          value: `${wallet?.balance.toFixed(2) ?? "0.00"} €`, icon: Wallet,       color: "#D88B2E" },
  ]

  const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PENDING:   { label: tRes("status_pending"),   bg: "rgba(216,139,46,0.10)", color: "#B5710D", border: "rgba(216,139,46,0.25)" },
    CONFIRMED: { label: tRes("status_confirmed"), bg: "rgba(31,107,77,0.10)",  color: "#1F6B4D", border: "rgba(31,107,77,0.20)" },
    CANCELLED: { label: tRes("status_cancelled"), bg: "rgba(220,38,38,0.08)",  color: "#dc2626", border: "rgba(220,38,38,0.15)" },
    NO_SHOW:   { label: tRes("status_no_show"),   bg: "rgba(15,31,26,0.06)",   color: "#2A3B34", border: "rgba(15,31,26,0.12)" },
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          {t("title")}
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "#88B5A2" }}>
          Bienvenido de nuevo, <span style={{ color: "#1F6B4D", fontWeight: 500 }}>{session.user.name}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl p-5"
              style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-[10px] uppercase tracking-[0.1em] font-mono leading-tight"
                  style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}
                >
                  {s.label}
                </p>
                <Icon className="h-4 w-4 shrink-0" style={{ color: s.color, opacity: 0.6 }} />
              </div>
              <p
                className="font-semibold"
                style={{ fontFamily: "var(--font-display)", color: s.color, fontSize: "clamp(22px,2.5vw,30px)", letterSpacing: "-0.03em" }}
              >
                {s.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/captador/campanas`}
          className="group rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
          style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#0F1F1A" }}>Ver campañas</p>
            <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>{activeCampaigns} campañas activas disponibles</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#1F6B4D" }} />
        </Link>
        <Link
          href={`/${locale}/captador/wallet`}
          className="group rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
          style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#0F1F1A" }}>Mi wallet</p>
            <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>
              Saldo: <span style={{ color: "#D88B2E", fontWeight: 500 }}>{wallet?.balance.toFixed(2) ?? "0.00"} €</span>
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#1F6B4D" }} />
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="font-semibold mb-4 text-[16px]" style={{ color: "#0F1F1A" }}>
          {t("recent")}
        </h2>
        {reservations.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center text-[14px]"
            style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)", color: "#88B5A2" }}
          >
            Sin actividad reciente. ¡Explora las campañas disponibles!
          </div>
        ) : (
          <div className="space-y-2">
            {reservations.map((r) => {
              const sc = statusConfig[r.status] ?? statusConfig.PENDING
              return (
                <Link
                  key={r.id}
                  href={`/${locale}/captador/reservas/${r.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:shadow-sm group"
                  style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0"
                      style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D" }}
                    >
                      {r.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-[14px]" style={{ color: "#0F1F1A" }}>{r.clientName}</p>
                      <p className="text-[12px]" style={{ color: "#88B5A2" }}>
                        {r.campaign.business.name} · {format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })} · {r.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                  >
                    {sc.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
