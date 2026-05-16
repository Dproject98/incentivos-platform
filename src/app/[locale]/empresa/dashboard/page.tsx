import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Megaphone, CalendarCheck, TrendingUp, Euro, ArrowRight } from "lucide-react"
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
    { label: t("active_campaigns"),       value: activeCampaigns,                                        icon: Megaphone,    color: "#1F6B4D" },
    { label: t("total_reservations"),     value: reservations.length,                                    icon: CalendarCheck, color: "#D88B2E" },
    { label: t("confirmed_reservations"), value: confirmedReservations,                                  icon: TrendingUp,   color: "#1F6B4D" },
    { label: t("total_incentives"),       value: `${(totalIncentives._sum.amount ?? 0).toFixed(2)} €`,  icon: Euro,         color: "#D88B2E" },
  ]

  const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PENDING:   { label: "Pendiente",   bg: "rgba(216,139,46,0.10)",  color: "#B5710D", border: "rgba(216,139,46,0.25)" },
    CONFIRMED: { label: "Confirmada",  bg: "rgba(31,107,77,0.10)",   color: "#1F6B4D", border: "rgba(31,107,77,0.20)" },
    CANCELLED: { label: "Cancelada",   bg: "rgba(220,38,38,0.08)",   color: "#dc2626", border: "rgba(220,38,38,0.15)" },
    NO_SHOW:   { label: "No presentó", bg: "rgba(15,31,26,0.06)",    color: "#2A3B34", border: "rgba(15,31,26,0.12)" },
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
          Bienvenido, <span style={{ color: "#1F6B4D", fontWeight: 500 }}>{business.name}</span>
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
          href={`/${locale}/empresa/campanas/nueva`}
          className="group rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
          style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#0F1F1A" }}>Nueva campaña</p>
            <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>Crea una nueva campaña de captación</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#1F6B4D" }} />
        </Link>
        <Link
          href={`/${locale}/empresa/staff`}
          className="group rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
          style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#0F1F1A" }}>Gestionar staff</p>
            <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>Personal autorizado para escanear QR</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#1F6B4D" }} />
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2
          className="font-semibold mb-4 text-[16px]"
          style={{ color: "#0F1F1A" }}
        >
          {t("recent_activity")}
        </h2>
        {reservations.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center text-[14px]"
            style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)", color: "#88B5A2" }}
          >
            Sin actividad reciente. ¡Crea tu primera campaña!
          </div>
        ) : (
          <div className="space-y-2">
            {reservations.map((r) => {
              const sc = statusConfig[r.status] ?? statusConfig.PENDING
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
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
                        {r.campaign.title} · {format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })} · {r.time} · {r.guests} pax
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {r.status === "CONFIRMED" && r.campaign.incentiveType !== "BONO" && (
                      <span className="text-[12px] font-semibold" style={{ color: "#D88B2E" }}>{r.campaign.incentiveValue}€</span>
                    )}
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                    >
                      {sc.label}
                    </span>
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
