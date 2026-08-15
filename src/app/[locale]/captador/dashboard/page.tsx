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
    { label: t("active_campaigns"), value: activeCampaigns,                              icon: Megaphone,    color: "#2bd49a" },
    { label: t("my_reservations"),  value: reservations.length,                          icon: CalendarCheck, color: "#2bd49a" },
    { label: t("confirmed"),        value: confirmedCount,                               icon: TrendingUp,   color: "#2bd49a" },
    { label: t("balance"),          value: `${wallet?.balance.toFixed(2) ?? "0.00"} €`, icon: Wallet,       color: "#2bd49a" },
  ]

  const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PENDING:   { label: tRes("status_pending"),   bg: "rgba(251,191,36,0.10)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
    CONFIRMED: { label: tRes("status_confirmed"), bg: "rgba(43,212,154,0.10)",  color: "#2bd49a", border: "rgba(43,212,154,0.20)" },
    CANCELLED: { label: tRes("status_cancelled"), bg: "rgba(220,38,38,0.12)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
    NO_SHOW:   { label: tRes("status_no_show"),   bg: "oklch(0.30 0.02 250)",   color: "oklch(0.72 0.01 250)", border: "oklch(0.30 0.02 250)" },
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          {t("title")}
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>
          Bienvenido de nuevo, <span style={{ color: "#2bd49a", fontWeight: 500 }}>{session.user.name}</span>
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
              style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-[10px] uppercase tracking-[0.1em] font-mono leading-tight"
                  style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)" }}
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
          style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#ffffff" }}>Ver campañas</p>
            <p className="text-[13px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>{activeCampaigns} campañas activas disponibles</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#2bd49a" }} />
        </Link>
        <Link
          href={`/${locale}/captador/wallet`}
          className="group rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
          style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#ffffff" }}>Mi wallet</p>
            <p className="text-[13px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>
              Saldo: <span style={{ color: "#2bd49a", fontWeight: 500 }}>{wallet?.balance.toFixed(2) ?? "0.00"} €</span>
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#2bd49a" }} />
        </Link>
      </div>

      {/* Onboarding — solo cuando no hay actividad */}
      {reservations.length === 0 && (
        <OnboardingCaptador locale={locale} activeCampaigns={activeCampaigns} />
      )}

      {/* Recent activity */}
      {reservations.length > 0 && (
      <div>
        <h2 className="font-semibold mb-4 text-[16px]" style={{ color: "#ffffff" }}>
          {t("recent")}
        </h2>
          <div className="space-y-2">
            {reservations.map((r) => {
              const sc = statusConfig[r.status] ?? statusConfig.PENDING
              return (
                <Link
                  key={r.id}
                  href={`/${locale}/captador/reservas/${r.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:shadow-sm group"
                  style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0"
                      style={{ background: "rgba(43,212,154,0.10)", color: "#2bd49a" }}
                    >
                      {r.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-[14px]" style={{ color: "#ffffff" }}>{r.clientName}</p>
                      <p className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>
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
      </div>
      )}
    </div>
  )
}

function OnboardingCaptador({ locale, activeCampaigns }: { locale: string; activeCampaigns: number }) {
  const steps = [
    {
      num: 1,
      done: true,
      title: "Cuenta creada",
      desc: "Ya estás registrado y listo para captar.",
      href: null,
      cta: null,
    },
    {
      num: 2,
      done: false,
      title: "Explora las campañas disponibles",
      desc: `Hay ${activeCampaigns} campaña${activeCampaigns !== 1 ? "s" : ""} activa${activeCampaigns !== 1 ? "s" : ""} en tu zona. Elige la que mejor encaje con tus contactos.`,
      href: `/${locale}/captador/campanas`,
      cta: "Ver campañas →",
    },
    {
      num: 3,
      done: false,
      title: "Refiere a tu primer cliente",
      desc: "Dentro de una campaña, registra una reserva con el nombre del cliente. Cuando asiste, cobras automáticamente.",
      href: `/${locale}/captador/campanas`,
      cta: "Hacer mi primera reserva →",
    },
  ]

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
    >
      <div className="mb-6">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold mb-3"
          style={{ background: "rgba(43,212,154,0.10)", border: "1px solid rgba(43,212,154,0.20)", color: "#2bd49a", letterSpacing: "0.08em" }}
        >
          PRIMEROS PASOS
        </div>
        <h3
          style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 22, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}
        >
          Empieza a ganar con tus recomendaciones
        </h3>
        <p className="text-[14px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>
          Solo tienes que hacer tres cosas. El sistema hace el resto.
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="flex gap-4 p-4 rounded-xl"
            style={{
              background: step.done ? "rgba(43,212,154,0.04)" : "rgba(255,255,255,0.02)",
              border: step.done ? "1px solid rgba(43,212,154,0.15)" : "1px solid oklch(0.28 0.018 250)",
            }}
          >
            {/* Step indicator */}
            <div
              className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-bold"
              style={
                step.done
                  ? { background: "rgba(43,212,154,0.15)", color: "#2bd49a" }
                  : { background: "rgba(255,255,255,0.06)", color: "oklch(0.62 0.01 250)" }
              }
            >
              {step.done ? "✓" : step.num}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-[14px]"
                style={{ color: step.done ? "#2bd49a" : "#ffffff", margin: 0 }}
              >
                {step.title}
              </p>
              <p className="text-[13px] mt-0.5" style={{ color: "oklch(0.62 0.01 250)" }}>
                {step.desc}
              </p>
              {step.href && step.cta && (
                <Link
                  href={step.href}
                  className="inline-block mt-2 text-[13px] font-semibold"
                  style={{ color: "#2bd49a", textDecoration: "none" }}
                >
                  {step.cta}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
