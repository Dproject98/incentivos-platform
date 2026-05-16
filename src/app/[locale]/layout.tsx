import type { Metadata } from "next"
import { Inter, Space_Grotesk, Inter_Tight, JetBrains_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { Toaster } from "@/components/ui/sonner"
import "../globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] })
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["500"] })

export const metadata: Metadata = {
  title: "Incentis",
  description: "Plataforma de incentivos anónimos para captación de clientes",
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
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
