"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggle = () => {
    const newLocale = locale === "es" ? "en" : "es"
    const segments = pathname.split("/")
    segments[1] = newLocale
    router.push(segments.join("/"))
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="gap-1">
      <Globe className="h-4 w-4" />
      {locale === "es" ? "EN" : "ES"}
    </Button>
  )
}
