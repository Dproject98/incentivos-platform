"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { signOut } from "next-auth/react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { IncentisLogo } from "@/components/IncentisLogo"
import { LayoutDashboard, Megaphone, CalendarCheck, Users, LogOut } from "lucide-react"

export function SidebarEmpresa() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/empresa/dashboard`, label: t("dashboard"),    icon: LayoutDashboard },
    { href: `/${locale}/empresa/campanas`,  label: t("campaigns"),    icon: Megaphone },
    { href: `/${locale}/empresa/reservas`,  label: t("reservations"), icon: CalendarCheck },
    { href: `/${locale}/empresa/staff`,     label: t("staff"),        icon: Users },
  ]

  return (
    <aside
      className="flex flex-col w-64 min-h-screen px-4 py-6 shrink-0"
      style={{ background: "#fff", borderRight: "1px solid rgba(15,31,26,0.10)" }}
    >
      {/* Logo */}
      <div className="mb-8 px-2">
        <Link href={`/${locale}`}>
          <IncentisLogo size="sm" />
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
                background: active ? "rgba(31,107,77,0.08)" : "transparent",
                color: active ? "#1F6B4D" : "#2A3B34",
                border: active ? "1px solid rgba(31,107,77,0.15)" : "1px solid transparent",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? "#1F6B4D" : "#88B5A2" }}
              />
              {link.label}
              {active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "#D88B2E" }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div
        className="flex flex-col gap-2 pt-4 border-t"
        style={{ borderColor: "rgba(15,31,26,0.08)" }}
      >
        <LanguageSwitcher />
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] transition-all hover:bg-red-50 w-full text-left"
          style={{ color: "#88B5A2" }}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  )
}
