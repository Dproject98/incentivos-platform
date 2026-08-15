import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { CalendarCheck } from "lucide-react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { ReservationActions } from "./reservation-actions"

export default async function EmpresaReservasPage() {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") redirect("/es/login")

  const locale = await getLocale()
  const t = await getTranslations("empresa.reservations")
  const dateLocale = locale === "en" ? enUS : es

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) redirect(`/${locale}/empresa/dashboard`)

  const reservations = await prisma.reservation.findMany({
    where: { campaign: { businessId: business.id } },
    include: { campaign: { select: { title: true, incentiveTypes: true, incentiveValue: true, fixedValue: true, percentageValue: true } } },
    orderBy: { createdAt: "desc" },
  })

  const statusStyle: Record<string, { bg: string; color: string; border: string; label: string }> = {
    PENDING:   { label: t("status_pending"),   bg: "rgba(251,191,36,0.10)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
    CONFIRMED: { label: t("status_confirmed"), bg: "rgba(43,212,154,0.10)",  color: "#2bd49a", border: "rgba(43,212,154,0.20)" },
    CANCELLED: { label: t("status_cancelled"), bg: "rgba(220,38,38,0.12)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
    NO_SHOW:   { label: t("status_no_show"),   bg: "oklch(0.30 0.02 250)",   color: "oklch(0.72 0.01 250)", border: "oklch(0.30 0.02 250)" },
  }

  const cols = "1fr 1fr 130px 50px 110px 80px 110px"

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}>
          {t("title")}
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>{reservations.length} reservas en total</p>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          <CalendarCheck className="h-10 w-10 mx-auto mb-4" style={{ color: "oklch(0.62 0.01 250)" }} />
          <p style={{ color: "oklch(0.62 0.01 250)" }}>{t("empty")}</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          {/* Header */}
          <div
            className="grid gap-4 px-5 py-3"
            style={{ gridTemplateColumns: cols, borderBottom: "1px solid oklch(0.30 0.02 250)" }}
          >
            {[t("client"), t("campaign"), t("date"), t("guests"), t("status"), t("incentive"), "Acción"].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div>
            {reservations.map((r, i) => {
              const ss = statusStyle[r.status] ?? statusStyle.PENDING
              const chosen = r.chosenIncentiveType
              const incentive = r.status === "CONFIRMED"
                ? chosen === "FIXED"      ? `${r.campaign.fixedValue ?? r.campaign.incentiveValue}€`
                : chosen === "PERCENTAGE" ? `${r.campaign.percentageValue ?? r.campaign.incentiveValue}%`
                : chosen === "BONO"       ? "Bono"
                : [
                    r.campaign.incentiveTypes.includes("FIXED") ? `${r.campaign.fixedValue ?? r.campaign.incentiveValue}€` : null,
                    r.campaign.incentiveTypes.includes("PERCENTAGE") ? `${r.campaign.percentageValue ?? r.campaign.incentiveValue}%` : null,
                    r.campaign.incentiveTypes.includes("BONO") ? "Bono" : null,
                  ].filter(Boolean).join(" + ")
                : "—"

              return (
                <div
                  key={r.id}
                  className="grid gap-4 px-5 py-4 transition-colors hover:bg-white/5"
                  style={{
                    gridTemplateColumns: cols,
                    borderTop: i > 0 ? "1px solid oklch(0.30 0.02 250)" : "none",
                  }}
                >
                  <div>
                    <p className="font-medium text-[14px]" style={{ color: "#ffffff" }}>{r.clientName}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: "oklch(0.62 0.01 250)" }}>{r.clientEmail}</p>
                  </div>
                  <p className="self-center text-[13px]" style={{ color: "oklch(0.72 0.01 250)" }}>{r.campaign.title}</p>
                  <div className="self-center">
                    <p className="text-[13px]" style={{ color: "#ffffff" }}>{format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })}</p>
                    <p className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>{r.time}</p>
                  </div>
                  <p className="self-center text-[13px]" style={{ color: "oklch(0.72 0.01 250)" }}>{r.guests}</p>
                  <div className="self-center">
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
                    >
                      {ss.label}
                    </span>
                  </div>
                  <p className="self-center font-semibold text-[13px]" style={{ color: r.status === "CONFIRMED" ? "#2bd49a" : "oklch(0.62 0.01 250)" }}>
                    {incentive}
                  </p>
                  <div className="self-center">
                    <ReservationActions reservationId={r.id} status={r.status} />
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
