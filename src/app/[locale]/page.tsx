import { getLocale } from "next-intl/server"
import { Nav } from "@/components/landing/Nav"
import { Hero } from "@/components/landing/Hero"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Features } from "@/components/landing/Features"
import { RoiCalculator } from "@/components/landing/RoiCalculator"
import { SocialProof } from "@/components/landing/SocialProof"
import { TierCards } from "@/components/landing/TierCards"
import { Pricing } from "@/components/landing/Pricing"
import { FAQ } from "@/components/landing/FAQ"
import { FooterCTA } from "@/components/landing/FooterCTA"
import { prisma } from "@/lib/prisma"

// Revalida cada 60 segundos para reflejar nuevas transacciones sin redeploy
export const revalidate = 60

export default async function LandingPage() {
  const locale = await getLocale()

  const [paidAgg, empresasCount, reservationCounts] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "CREDIT" },
    }),
    prisma.user.count({ where: { role: "EMPRESA" } }),
    prisma.reservation.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ])

  const totalPaid = paidAgg._sum.amount ?? 0
  const confirmed = reservationCounts.find((r) => r.status === "CONFIRMED")?._count.id ?? 0
  const total = reservationCounts.reduce((acc, r) => acc + r._count.id, 0)
  const conversionRate = total > 0 ? Math.round((confirmed / total) * 100) : 0

  return (
    <div style={{ background: "#F2EBDC", color: "#0F1F1A", fontFamily: "var(--font-body)", minHeight: "100vh" }}>
      <Nav locale={locale} />
      <main>
        <Hero locale={locale} />
        <HowItWorks />
        <Features />
        <RoiCalculator />
        <SocialProof totalPaid={totalPaid} empresasCount={empresasCount} conversionRate={conversionRate} />
        <TierCards />
        <Pricing locale={locale} />
        <FAQ />
      </main>
      <FooterCTA locale={locale} />
    </div>
  )
}
