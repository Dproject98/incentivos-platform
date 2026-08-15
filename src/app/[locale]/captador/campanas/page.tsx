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

  const incentiveConfig: Record<string, { icon: typeof Euro; color: string; bg: string; border: string; label: string }> = {
    FIXED:      { icon: Euro,       color: "#2bd49a", bg: "rgba(43,212,154,0.10)",  border: "rgba(43,212,154,0.20)",  label: "Fijo" },
    PERCENTAGE: { icon: TrendingUp, color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)",  label: "%" },
    BONO:       { icon: Gift,       color: "#2bd49a", bg: "rgba(43,212,154,0.10)",  border: "rgba(43,212,154,0.20)",  label: "Bono" },
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}>
          {t("title")}
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>{campaigns.length} campañas activas disponibles</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          <Megaphone className="h-10 w-10 mx-auto mb-4" style={{ color: "oklch(0.62 0.01 250)" }} />
          <p style={{ color: "oklch(0.62 0.01 250)" }}>{t("empty")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            // Use the first non-BONO type for the badge style, fallback to BONO, then FIXED
            const primaryType = campaign.incentiveTypes.find((t: string) => t !== "BONO") ?? campaign.incentiveTypes[0] ?? "FIXED"
            const cfg = incentiveConfig[primaryType] ?? incentiveConfig.FIXED
            const Icon = cfg.icon
            const incentiveText = [
              campaign.incentiveTypes.includes("FIXED") ? `${campaign.fixedValue ?? campaign.incentiveValue}€ ${t("per_reservation")}` : null,
              campaign.incentiveTypes.includes("PERCENTAGE") ? `${campaign.percentageValue ?? campaign.incentiveValue}% ${t("per_reservation")}` : null,
              campaign.incentiveTypes.includes("BONO") ? (campaign.bonusDescription ?? "Bono") : null,
            ].filter(Boolean).join(" + ")

            return (
              <div
                key={campaign.id}
                className="rounded-2xl flex flex-col transition-shadow hover:shadow-sm"
                style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[15px] truncate" style={{ color: "#ffffff" }}>{campaign.title}</h3>
                      <p className="text-[13px] mt-0.5" style={{ color: "oklch(0.62 0.01 250)" }}>{campaign.business.name}</p>
                    </div>
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {campaign.description && (
                    <p className="text-[13px] mb-4 line-clamp-2" style={{ color: "oklch(0.62 0.01 250)" }}>{campaign.description}</p>
                  )}

                  <div
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >
                    <Icon className="h-4 w-4" />
                    {incentiveText}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {campaign.business.address && (
                      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {campaign.business.address}
                      </div>
                    )}
                    <div className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>
                      {campaign.endDate
                        ? `${t("expires")}: ${format(new Date(campaign.endDate), "dd MMM yyyy", { locale: dateLocale })}`
                        : t("no_expiry")}
                    </div>
                  </div>
                </div>

                <div className="p-4" style={{ borderTop: "1px solid oklch(0.30 0.02 250)" }}>
                  <Link
                    href={`/${locale}/captador/reservas/nueva/${campaign.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-90"
                    style={{ background: "#2bd49a", color: "#0c0c0a" }}
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
