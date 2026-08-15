import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Megaphone, CalendarCheck, TrendingUp, Euro, ArrowRight, AlertCircle } from "lucide-react"
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

  const pendingPayment = await prisma.reservation.aggregate({
    where: { campaign: { businessId: business.id }, status: "CONFIRMED", empresaPaid: false, empresaPaymentId: null, chosenIncentiveType: { in: ["FIXED", "PERCENTAGE"] } },
    _count: { id: true },
  })
  const pendingCount = pendingPayment._count.id

  const [campaigns, reservations] = await Promise.all([
    prisma.campaign.findMany({
      where: { businessId: business.id },
      include: { _count: { select: { reservations: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reservation.findMany({
      where: { campaign: { businessId: business.id } },
      include: { campaign: { select: { title: true, incentiveTypes: true, incentiveValue: true, fixedValue: true, percentageValue: true } } },
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
    { label: t("active_campaigns"),       value: activeCampaigns,                                        icon: Megaphone,    color: "#2bd49a" },
    { label: t("total_reservations"),     value: reservations.length,                                    icon: CalendarCheck, color: "#2bd49a" },
    { label: t("confirmed_reservations"), value: confirmedReservations,                                  icon: TrendingUp,   color: "#2bd49a" },
    { label: t("total_incentives"),       value: `${(totalIncentives._sum.amount ?? 0).toFixed(2)} €`,  icon: Euro,         color: "#2bd49a" },
  ]

  const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PENDING:   { label: "Pendiente",   bg: "rgba(251,191,36,0.10)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
    CONFIRMED: { label: "Confirmada",  bg: "rgba(43,212,154,0.10)",  color: "#2bd49a", border: "rgba(43,212,154,0.20)" },
    CANCELLED: { label: "Cancelada",   bg: "rgba(220,38,38,0.12)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
    NO_SHOW:   { label: "No presentó", bg: "oklch(0.30 0.02 250)",   color: "oklch(0.72 0.01 250)", border: "oklch(0.30 0.02 250)" },
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
          Bienvenido, <span style={{ color: "#2bd49a", fontWeight: 500 }}>{business.name}</span>
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

      {/* Comisiones pendientes de pago */}
      {pendingCount > 0 && (
        <Link
          href={`/${locale}/empresa/facturacion`}
          className="flex items-center gap-4 rounded-2xl p-4 transition-opacity hover:opacity-90"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", textDecoration: "none" }}
        >
          <AlertCircle className="h-5 w-5 shrink-0" style={{ color: "#fbbf24" }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px]" style={{ color: "#fbbf24" }}>
              {pendingCount} comisión{pendingCount !== 1 ? "es" : ""} pendiente{pendingCount !== 1 ? "s" : ""} de pago
            </p>
            <p className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>
              Accede a Facturación para ver el detalle e indicar tu transferencia.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0" style={{ color: "#fbbf24" }} />
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/empresa/campanas/nueva`}
          className="group rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
          style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#ffffff" }}>Nueva campaña</p>
            <p className="text-[13px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>Crea una nueva campaña de captación</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#2bd49a" }} />
        </Link>
        <Link
          href={`/${locale}/empresa/staff`}
          className="group rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm"
          style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
        >
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#ffffff" }}>Gestionar staff</p>
            <p className="text-[13px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>Personal autorizado para escanear QR</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: "#2bd49a" }} />
        </Link>
      </div>

      {/* Onboarding — solo cuando no hay campañas */}
      {campaigns.length === 0 && (
        <OnboardingEmpresa locale={locale} />
      )}

      {/* Recent activity */}
      {reservations.length > 0 && (
      <div>
        <h2
          className="font-semibold mb-4 text-[16px]"
          style={{ color: "#ffffff" }}
        >
          {t("recent_activity")}
        </h2>
          <div className="space-y-2">
            {reservations.map((r) => {
              const sc = statusConfig[r.status] ?? statusConfig.PENDING
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
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
                        {r.campaign.title} · {format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })} · {r.time} · {r.guests} pax
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {r.status === "CONFIRMED" && r.chosenIncentiveType === "FIXED" && (
                      <span className="text-[12px] font-semibold" style={{ color: "#2bd49a" }}>{r.campaign.fixedValue ?? r.campaign.incentiveValue}€</span>
                    )}
                    {r.status === "CONFIRMED" && r.chosenIncentiveType === "PERCENTAGE" && (
                      <span className="text-[12px] font-semibold" style={{ color: "#2bd49a" }}>{r.campaign.percentageValue ?? r.campaign.incentiveValue}%</span>
                    )}
                    {r.status === "CONFIRMED" && r.chosenIncentiveType === "BONO" && (
                      <span className="text-[12px] font-semibold" style={{ color: "#2bd49a" }}>Bono</span>
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
      </div>
      )}
    </div>
  )
}

function OnboardingEmpresa({ locale }: { locale: string }) {
  const steps = [
    {
      num: 1,
      done: true,
      title: "Negocio registrado",
      desc: "Tu cuenta está activa y lista para configurar.",
      href: null,
      cta: null,
    },
    {
      num: 2,
      done: false,
      title: "Crea tu primera campaña",
      desc: "Define qué incentivo ofreces (fijo, porcentaje o bono) y cuántos clientes quieres atraer.",
      href: `/${locale}/empresa/campanas/nueva`,
      cta: "Crear campaña →",
    },
    {
      num: 3,
      done: false,
      title: "Añade staff para validar QR",
      desc: "Registra a tu equipo con un PIN de 4 dígitos. Ellos escanearán el QR cuando llegue cada cliente referido.",
      href: `/${locale}/empresa/staff`,
      cta: "Añadir staff →",
    },
    {
      num: 4,
      done: false,
      title: "Los captadores traen clientes",
      desc: "Cuando una campaña está activa, los captadores la ven y empiezan a referir clientes. Tú solo pagas por cada asistencia confirmada.",
      href: null,
      cta: null,
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
          Activo en 10 minutos
        </h3>
        <p className="text-[14px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>
          Sigue estos pasos y tendrás tu primera campaña funcionando hoy.
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
