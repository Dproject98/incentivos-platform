"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { signOut } from "next-auth/react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { IncentisLogo } from "@/components/IncentisLogo"
import { LayoutDashboard, Megaphone, CalendarCheck, Users, Gift, LogOut, Receipt } from "lucide-react"

export function SidebarEmpresa() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/empresa/dashboard`,    label: t("dashboard"),    icon: LayoutDashboard },
    { href: `/${locale}/empresa/campanas`,     label: t("campaigns"),    icon: Megaphone },
    { href: `/${locale}/empresa/reservas`,     label: t("reservations"), icon: CalendarCheck },
    { href: `/${locale}/empresa/staff`,        label: t("staff"),        icon: Users },
    { href: `/${locale}/empresa/canjes`,       label: "Canjes",          icon: Gift  },
    { href: `/${locale}/empresa/facturacion`,  label: "Facturación",     icon: Receipt },
  ]

  return (
    <aside
      className="flex flex-col w-64 min-h-screen px-4 py-6 shrink-0"
      style={{ background: "oklch(0.15 0.012 250)", borderRight: "1px solid oklch(0.30 0.02 250)" }}
    >
      {/* Logo */}
      <div className="mb-8 px-2">
        <Link href={`/${locale}`}>
          <IncentisLogo size="sm" light />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all"
              style={{
                background: active ? "oklch(0.80 0.17 162 / 0.12)" : "transparent",
                color: active ? "#2bd49a" : "oklch(0.72 0.01 250)",
                border: active ? "1px solid oklch(0.80 0.17 162 / 0.20)" : "1px solid transparent",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? "#2bd49a" : "oklch(0.62 0.01 250)" }}
              />
              {link.label}
              {active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "#2bd49a" }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div
        className="flex flex-col gap-2 pt-4 border-t"
        style={{ borderColor: "oklch(0.30 0.02 250)" }}
      >
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] transition-all hover:bg-white/5 w-full text-left"
          style={{ color: "oklch(0.62 0.01 250)" }}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  )
}
