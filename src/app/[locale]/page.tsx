import { getLocale } from "next-intl/server"
import { Nav } from "@/components/landing/Nav"
import { Hero } from "@/components/landing/Hero"
import { TrustBar } from "@/components/landing/TrustBar"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Features } from "@/components/landing/Features"
import { RoiCalculator } from "@/components/landing/RoiCalculator"
import { SocialProof } from "@/components/landing/SocialProof"
import { TierCards } from "@/components/landing/TierCards"
import { Pricing } from "@/components/landing/Pricing"
import { FAQ } from "@/components/landing/FAQ"
import { FooterCTA } from "@/components/landing/FooterCTA"

export default async function LandingPage() {
  const locale = await getLocale()

  return (
    <div style={{ background: "#F2EBDC", color: "#0F1F1A", fontFamily: "var(--font-body)", minHeight: "100vh" }}>
      <Nav locale={locale} />
      <main>
        <Hero locale={locale} />
        <TrustBar />
        <HowItWorks />
        <Features />
        <RoiCalculator />
        <SocialProof />
        <TierCards />
        <Pricing locale={locale} />
        <FAQ />
      </main>
      <FooterCTA locale={locale} />
    </div>
  )
}
