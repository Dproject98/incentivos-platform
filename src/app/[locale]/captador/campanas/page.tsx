import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Euro, Gift, TrendingUp, MapPin, ArrowRight, Megaphone } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

export default async function CampanasPage() {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") redirect("/es/login")

  const locale = await getLocale()
  const t = await getTranslations("captador.campaigns")
  const dateLocale = locale === "en" ? enUS : es

  type Campaign = Awaited<ReturnType<typeof prisma.campaign.findMany>>[number] & {
    business: { name: string; type: string; address: string | null }
  }

  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    include: { business: { select: { name: true, type: true, address: true } } },
    orderBy: { createdAt: "desc" },
  }) as Campaign[]

  const incentiveConfig = {
    FIXED:      { icon: Euro,       color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   label: "Fijo" },
    PERCENTAGE: { icon: TrendingUp, color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",     label: "%" },
    BONO:       { icon: Gift,       color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "Bono" },
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">{campaigns.length} campañas activas disponibles</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass rounded-2xl p-16 border border-white/5 text-center">
          <Megaphone className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const cfg = incentiveConfig[campaign.incentiveType]
            const Icon = cfg.icon
            const incentiveText = campaign.incentiveType === "BONO"
              ? campaign.bonusDescription
              : campaign.incentiveType === "PERCENTAGE"
              ? `${campaign.incentiveValue}% ${t("per_reservation")}`
              : `${campaign.incentiveValue}€ ${t("per_reservation")}`

            return (
              <div key={campaign.id} className="glass rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-glow-purple flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{campaign.title}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">{campaign.business.name}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {campaign.description && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{campaign.description}</p>
                  )}

                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                    {incentiveText}
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    {campaign.business.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        {campaign.business.address}
                      </div>
                    )}
                    <div className="text-slate-600">
                      {campaign.endDate
                        ? `${t("expires")}: ${format(new Date(campaign.endDate), "dd MMM yyyy", { locale: dateLocale })}`
                        : t("no_expiry")}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-white/5">
                  <Link
                    href={`/${locale}/captador/reservas/nueva/${campaign.id}`}
                    className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all"
                  >
                    {t("reserve")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
