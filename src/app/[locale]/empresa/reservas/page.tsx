import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { CalendarCheck } from "lucide-react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

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
    include: { campaign: { select: { title: true, incentiveType: true, incentiveValue: true } } },
    orderBy: { createdAt: "desc" },
  })

  const statusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: t("status_pending"),   cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    CONFIRMED: { label: t("status_confirmed"), cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    CANCELLED: { label: t("status_cancelled"), cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    NO_SHOW:   { label: t("status_no_show"),   cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">{reservations.length} reservas en total</p>
      </div>

      {reservations.length === 0 ? (
        <div className="glass rounded-2xl p-16 border border-white/5 text-center">
          <CalendarCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_140px_60px_100px_80px] gap-4 px-5 py-3 border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
            <span>{t("client")}</span>
            <span>{t("campaign")}</span>
            <span>{t("date")}</span>
            <span>{t("guests")}</span>
            <span>{t("status")}</span>
            <span>{t("incentive")}</span>
          </div>

          {/* Rows */}
          <div>
            {reservations.map((r, i) => {
              const sc = statusConfig[r.status] ?? statusConfig.PENDING
              const incentive = r.status === "CONFIRMED"
                ? r.campaign.incentiveType === "BONO" ? "Bono" : `${r.campaign.incentiveValue}€`
                : "—"

              return (
                <div
                  key={r.id}
                  className={`grid grid-cols-[1fr_1fr_140px_60px_100px_80px] gap-4 px-5 py-4 text-sm ${
                    i < reservations.length - 1 ? "border-b border-white/5" : ""
                  } hover:bg-white/3 transition-colors`}
                >
                  <div>
                    <p className="text-white font-medium">{r.clientName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{r.clientEmail}</p>
                  </div>
                  <p className="text-slate-400 self-center">{r.campaign.title}</p>
                  <div className="self-center">
                    <p className="text-slate-300">{format(new Date(r.date), "dd MMM yyyy", { locale: dateLocale })}</p>
                    <p className="text-xs text-slate-600">{r.time}</p>
                  </div>
                  <p className="text-slate-400 self-center">{r.guests}</p>
                  <div className="self-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${sc.cls}`}>{sc.label}</span>
                  </div>
                  <p className={`self-center font-medium text-sm ${r.status === "CONFIRMED" ? "text-pink-400" : "text-slate-600"}`}>
                    {incentive}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
