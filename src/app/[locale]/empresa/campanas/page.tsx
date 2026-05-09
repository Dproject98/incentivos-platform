import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Plus, CalendarCheck, Megaphone } from "lucide-react"
import Link from "next/link"
import { CampaignActions } from "./campaign-actions"

export default async function EmpresaCampanasPage() {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") redirect("/es/login")

  const locale = await getLocale()
  const t = await getTranslations("empresa.campaigns")

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) redirect(`/${locale}/empresa/dashboard`)

  const campaigns = await prisma.campaign.findMany({
    where: { businessId: business.id },
    include: { _count: { select: { reservations: true } } },
    orderBy: { createdAt: "desc" },
  })

  const statusConfig: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: t("status_active"), cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    PAUSED: { label: t("status_paused"), cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    ENDED:  { label: t("status_ended"),  cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
          <p className="text-slate-400 mt-1">{campaigns.length} campañas creadas</p>
        </div>
        <Link
          href={`/${locale}/empresa/campanas/nueva`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-sm font-semibold transition-all"
        >
          <Plus className="h-4 w-4" />
          {t("new")}
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass rounded-2xl p-16 border border-white/5 text-center">
          <Megaphone className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const sc = statusConfig[campaign.status] ?? statusConfig.ENDED
            return (
              <div key={campaign.id} className="glass rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{campaign.title}</h3>
                      {campaign.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{campaign.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Incentivo</span>
                      <span className="text-white font-medium">
                        {campaign.incentiveType === "BONO"
                          ? campaign.bonusDescription
                          : campaign.incentiveType === "PERCENTAGE"
                          ? `${campaign.incentiveValue}%`
                          : `${campaign.incentiveValue}€`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5"><CalendarCheck className="h-3.5 w-3.5" />{t("reservations_count")}</span>
                      <span className="text-cyan-300 font-medium">{campaign._count.reservations}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-white/5">
                  <CampaignActions campaignId={campaign.id} status={campaign.status} locale={locale} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
