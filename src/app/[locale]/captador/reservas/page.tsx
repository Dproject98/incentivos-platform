import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Plus, CalendarCheck, Users, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

export default async function ReservasPage() {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") redirect("/es/login")

  const locale = await getLocale()
  const t = await getTranslations("captador.reservations")
  const dateLocale = locale === "en" ? enUS : es

  const reservations = await prisma.reservation.findMany({
    where: { captadorId: session.user.id },
    include: { campaign: { include: { business: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  })

  const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PENDING:   { label: t("status_pending"),   bg: "rgba(216,139,46,0.10)", color: "#B5710D", border: "rgba(216,139,46,0.25)" },
    CONFIRMED: { label: t("status_confirmed"), bg: "rgba(31,107,77,0.10)",  color: "#1F6B4D", border: "rgba(31,107,77,0.20)" },
    CANCELLED: { label: t("status_cancelled"), bg: "rgba(220,38,38,0.08)",  color: "#dc2626", border: "rgba(220,38,38,0.15)" },
    NO_SHOW:   { label: t("status_no_show"),   bg: "rgba(15,31,26,0.06)",   color: "#2A3B34", border: "rgba(15,31,26,0.12)" },
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}>
            {t("title")}
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#88B5A2" }}>{reservations.length} reservas en total</p>
        </div>
        <Link
          href={`/${locale}/captador/campanas`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#1F6B4D", color: "#F2EBDC" }}
        >
          <Plus className="h-4 w-4" />
          {t("new")}
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          <CalendarCheck className="h-10 w-10 mx-auto mb-4" style={{ color: "#88B5A2" }} />
          <p style={{ color: "#88B5A2" }}>Sin reservas aún. ¡Explora las campañas disponibles!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reservations.map((r) => {
            const sc = statusConfig[r.status] ?? statusConfig.PENDING
            return (
              <Link
                key={r.id}
                href={`/${locale}/captador/reservas/${r.id}`}
                className="flex items-center justify-between p-4 rounded-2xl transition-colors hover:bg-[#F8F5EE] block"
                style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
                    style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D" }}
                  >
                    {r.clientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[14px]" style={{ color: "#0F1F1A" }}>{r.clientName}</p>
                    <p className="text-[13px]" style={{ color: "#88B5A2" }}>{r.campaign.business.name} · {r.campaign.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[12px]" style={{ color: "#88B5A2" }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })} · {r.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {r.guests} personas
                      </span>
                    </div>
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
  )
}
