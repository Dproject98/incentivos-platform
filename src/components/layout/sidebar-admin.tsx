"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { signOut } from "next-auth/react"
import { IncentisLogo } from "@/components/IncentisLogo"
import { LayoutDashboard, Users, Megaphone, ArrowLeftRight, LogOut, ShieldCheck } from "lucide-react"

export function SidebarAdmin() {
  const locale = useLocale()
  const pathname = usePathname()

  const links = [
    { href: `/${locale}/admin/dashboard`,      label: "Panel",          icon: LayoutDashboard },
    { href: `/${locale}/admin/usuarios`,        label: "Usuarios",       icon: Users },
    { href: `/${locale}/admin/campanas`,        label: "Campañas",       icon: Megaphone },
    { href: `/${locale}/admin/transacciones`,   label: "Transacciones",  icon: ArrowLeftRight },
  ]

  return (
    <aside
      className="flex flex-col w-64 min-h-screen px-4 py-6 shrink-0"
      style={{ background: "#0F1F1A", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo + badge */}
      <div className="mb-8 px-2">
        <Link href={`/${locale}`}>
          <IncentisLogo size="sm" />
        </Link>
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider"
          style={{ background: "rgba(31,107,77,0.20)", color: "#88B5A2", border: "1px solid rgba(31,107,77,0.25)" }}
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
                background: active ? "rgba(31,107,77,0.15)" : "transparent",
                color: active ? "#F2EBDC" : "rgba(242,235,220,0.50)",
                border: active ? "1px solid rgba(31,107,77,0.25)" : "1px solid transparent",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: active ? "#88B5A2" : "rgba(136,181,162,0.45)" }} />
              {link.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#D88B2E" }} />
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
