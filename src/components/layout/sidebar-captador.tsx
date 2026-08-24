"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { signOut } from "next-auth/react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { IncentisLogo } from "@/components/IncentisLogo"
import { LayoutDashboard, Megaphone, CalendarCheck, Wallet, LogOut } from "lucide-react"

export function SidebarCaptador() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/captador/dashboard`, label: t("dashboard"),    icon: LayoutDashboard },
    { href: `/${locale}/captador/campanas`,  label: t("campaigns"),    icon: Megaphone },
    { href: `/${locale}/captador/reservas`,  label: t("reservations"), icon: CalendarCheck },
    { href: `/${locale}/captador/wallet`,    label: t("wallet"),       icon: Wallet },
  ]

  return (
    <aside
      className="flex flex-col w-64 min-h-screen px-4 py-6 shrink-0"
      style={{ background: "#16171A", borderRight: "1px solid #34373C" }}
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
                background: active ? "oklch(0.70 0.15 35 / 0.12)" : "transparent",
                color: active ? "#E8735A" : "#AEB2B8",
                border: active ? "1px solid oklch(0.70 0.15 35 / 0.20)" : "1px solid transparent",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? "#E8735A" : "#93979E" }}
              />
              {link.label}
              {active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "#E8735A" }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div
        className="flex flex-col gap-2 pt-4 border-t"
        style={{ borderColor: "#34373C" }}
      >
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] transition-all hover:bg-white/5 w-full text-left"
          style={{ color: "#93979E" }}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  )
}
