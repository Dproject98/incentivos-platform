import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Plus, CalendarCheck, Megaphone } from "lucide-react"
import Link from "next/link"
import { CampaignActions } from "./campaign-actions"

const statusStyle: Record<string, { bg: string; color: string; border: string; label?: string }> = {
  ACTIVE: { bg: "rgba(232,115,90,0.10)",  color: "#E8735A", border: "rgba(232,115,90,0.20)" },
  PAUSED: { bg: "rgba(217,179,108,0.10)",  color: "#D9B36C", border: "rgba(217,179,108,0.25)" },
  ENDED:  { bg: "#34373C",   color: "#AEB2B8", border: "#34373C" },
}

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

  const statusLabel: Record<string, string> = {
    ACTIVE: t("status_active"),
    PAUSED: t("status_paused"),
    ENDED:  t("status_ended"),
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#F2F1EF", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}>
            {t("title")}
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#93979E" }}>{campaigns.length} campañas creadas</p>
        </div>
        <Link
          href={`/${locale}/empresa/campanas/nueva`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#E8735A", color: "#16171A" }}
        >
          <Plus className="h-4 w-4" />
          {t("new")}
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
          <Megaphone className="h-10 w-10 mx-auto mb-4" style={{ color: "#93979E" }} />
          <p style={{ color: "#93979E" }}>{t("empty")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const ss = statusStyle[campaign.status] ?? statusStyle.ENDED
            return (
              <div
                key={campaign.id}
                className="rounded-2xl flex flex-col transition-shadow hover:shadow-sm"
                style={{ background: "#1E2023", border: "1px solid #34373C" }}
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[15px] truncate" style={{ color: "#F2F1EF" }}>{campaign.title}</h3>
                      {campaign.description && (
                        <p className="text-[13px] mt-1 line-clamp-2" style={{ color: "#93979E" }}>{campaign.description}</p>
                      )}
                    </div>
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
                      style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
                    >
                      {statusLabel[campaign.status]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span style={{ color: "#93979E" }}>Incentivo</span>
                      <span className="font-semibold" style={{ color: "#E8735A" }}>
                        {[
                          campaign.incentiveTypes.includes("FIXED") ? `${campaign.fixedValue ?? campaign.incentiveValue}€` : null,
                          campaign.incentiveTypes.includes("PERCENTAGE") ? `${campaign.percentageValue ?? campaign.incentiveValue}%` : null,
                          campaign.incentiveTypes.includes("BONO") ? (campaign.bonusDescription ?? "Bono") : null,
                        ].filter(Boolean).join(" + ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-1.5" style={{ color: "#93979E" }}>
                        <CalendarCheck className="h-3.5 w-3.5" />
                        {t("reservations_count")}
                      </span>
                      <span className="font-semibold" style={{ color: "#E8735A" }}>{campaign._count.reservations}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t" style={{ borderColor: "#34373C" }}>
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
