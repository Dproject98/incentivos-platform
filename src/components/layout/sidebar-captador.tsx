"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  LayoutDashboard, Megaphone, CalendarCheck, Wallet, LogOut, QrCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function SidebarCaptador() {
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/captador/dashboard`, label: t("dashboard"),     icon: LayoutDashboard },
    { href: `/${locale}/captador/campanas`,  label: t("campaigns"),     icon: Megaphone },
    { href: `/${locale}/captador/reservas`,  label: t("reservations"),  icon: CalendarCheck },
    { href: `/${locale}/captador/wallet`,    label: t("wallet"),        icon: Wallet },
  ]

  return (
    <aside
      className="flex flex-col w-64 min-h-screen px-4 py-6 gap-2 border-r border-white/5"
      style={{ background: "rgba(10, 14, 39, 0.95)", backdropFilter: "blur(12px)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <QrCode className="h-5 w-5 text-purple-400" />
        </div>
        <span className="font-bold text-lg text-white">Incentivos</span>
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                active
                  ? "bg-purple-600/20 border border-purple-500/30 text-purple-300 font-medium shadow-glow-purple"
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-purple-400" : "text-slate-600")} />
              {link.label}
              {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
        <LanguageSwitcher />
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 text-slate-600 hover:text-slate-300 hover:bg-white/5"
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
    </aside>
  )
}
