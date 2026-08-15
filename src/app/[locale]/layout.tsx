import type { Metadata } from "next"
import { Inter, Space_Grotesk, Inter_Tight, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { Toaster } from "@/components/ui/sonner"
import { CookieBanner } from "@/components/CookieBanner"
import "../globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] })
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600"] })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-brand", weight: ["400", "500", "600", "700", "800"] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://incentis.app"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Incentis — Incentivos anónimos para captación de clientes",
    template: "%s · Incentis",
  },
  description:
    "Convierte clientes satisfechos en captadores. Crea campañas de incentivos, verifica reservas con QR y paga comisiones automáticamente.",
  keywords: [
    "incentivos clientes",
    "captación clientes",
    "programa referidos",
    "comisiones automáticas",
    "QR verificación",
    "marketing restaurantes",
    "marketing hoteles",
    "software incentivos",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_GB",
    url: APP_URL,
    siteName: "Incentis",
    title: "Incentis — Incentivos anónimos para captación de clientes",
    description:
      "Convierte clientes satisfechos en captadores. Crea campañas, verifica con QR y paga comisiones automáticamente.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Incentis — Incentivos anónimos para captación de clientes",
    description:
      "Convierte clientes satisfechos en captadores. Crea campañas, verifica con QR y paga comisiones automáticamente.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable} ${interTight.variable} ${jetbrainsMono.variable} ${bricolage.variable}`}>
      <body className="antialiased font-sans" style={{ background: "oklch(0.15 0.012 250)" }}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
