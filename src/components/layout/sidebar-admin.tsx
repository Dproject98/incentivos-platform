"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { signOut } from "next-auth/react"
import { IncentisLogo } from "@/components/IncentisLogo"
import { LayoutDashboard, Users, Megaphone, ArrowLeftRight, LogOut, ShieldCheck, Banknote } from "lucide-react"

export function SidebarAdmin() {
  const locale = useLocale()
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/admin/dashboard`,      label: "Panel",          icon: LayoutDashboard },
    { href: `/${locale}/admin/usuarios`,        label: "Usuarios",       icon: Users },
    { href: `/${locale}/admin/campanas`,        label: "Campañas",       icon: Megaphone },
    { href: `/${locale}/admin/transacciones`,   label: "Transacciones",  icon: ArrowLeftRight },
    { href: `/${locale}/admin/cobros`,          label: "Cobros",         icon: Banknote },
  ]

  return (
    <aside
      className="flex flex-col w-64 min-h-screen px-4 py-6 shrink-0"
      style={{ background: "#16171A", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo + badge */}
      <div className="mb-8 px-2">
        <Link href={`/${locale}`}>
          <IncentisLogo size="sm" light />
        </Link>
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider"
          style={{ background: "oklch(0.70 0.15 35 / 0.12)", color: "#E8735A", border: "1px solid oklch(0.70 0.15 35 / 0.20)" }}
        >
          <ShieldCheck className="h-3 w-3" />
          Admin
        </div>
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
              <Icon className="h-4 w-4 shrink-0" style={{ color: active ? "#E8735A" : "#93979E" }} />
              {link.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#E8735A" }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] transition-all w-full text-left hover:bg-white/5"
          style={{ color: "rgba(136,181,162,0.60)" }}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
