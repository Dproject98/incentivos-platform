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

  const statusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: t("status_pending"),   cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    CONFIRMED: { label: t("status_confirmed"), cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    CANCELLED: { label: t("status_cancelled"), cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    NO_SHOW:   { label: t("status_no_show"),   cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
          <p className="text-slate-400 mt-1">{reservations.length} reservas en total</p>
        </div>
        <Link
          href={`/${locale}/captador/campanas`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all"
        >
          <Plus className="h-4 w-4" />
          {t("new")}
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="glass rounded-2xl p-16 border border-white/5 text-center">
          <CalendarCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">Sin reservas aún. ¡Explora las campañas disponibles!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const sc = statusConfig[r.status] ?? statusConfig.PENDING
            return (
              <Link
                key={r.id}
                href={`/${locale}/captador/reservas/${r.id}`}
                className="flex items-center justify-between p-4 glass rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm flex-shrink-0">
                    {r.clientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{r.clientName}</p>
                    <p className="text-sm text-slate-500">{r.campaign.business.name} · {r.campaign.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
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
                <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
