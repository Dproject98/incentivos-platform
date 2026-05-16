"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const links = [
  { label: "Producto",        href: "#producto" },
  { label: "Cómo funciona",   href: "#como-funciona" },
  { label: "Niveles",         href: "#niveles" },
  { label: "Precios",         href: "#precios" },
  { label: "Casos",           href: "#casos" },
]

export function Nav({ locale }: { locale: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? "rgba(242,235,220,0.92)" : "#F2EBDC",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: "1px solid rgba(15,31,26,0.10)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-1.5 shrink-0">
          <span className="text-amber-DEFAULT text-xl leading-none" style={{ color: "#D88B2E" }}>✦</span>
          <span
            className="font-display font-semibold text-[17px] tracking-[-0.04em]"
            style={{ color: "#0F1F1A", fontFamily: "var(--font-display)" }}
          >
            incentis
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium transition-colors hover:text-forest-DEFAULT"
              style={{ color: "#2A3B34" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={`/${locale}/login`}
            className="text-[14px] font-medium px-4 py-2 rounded-full transition-colors hover:bg-black/5"
            style={{ color: "#0F1F1A" }}
          >
            Entrar
          </Link>
          <Link
            href={`/${locale}/register/empresa`}
            className="text-[14px] font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90"
            style={{ background: "#1F6B4D", color: "#F2EBDC" }}
          >
            Empezar
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <span className="block w-5 h-0.5 bg-ink transition-all" style={{ background: "#0F1F1A", transform: open ? "rotate(45deg) translate(4px,4px)" : "" }} />
          <span className="block w-5 h-0.5 bg-ink transition-all" style={{ background: "#0F1F1A", opacity: open ? 0 : 1 }} />
          <span className="block w-5 h-0.5 bg-ink transition-all" style={{ background: "#0F1F1A", transform: open ? "rotate(-45deg) translate(4px,-4px)" : "" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-6 py-4 flex flex-col gap-3" style={{ borderColor: "rgba(15,31,26,0.10)", background: "#F2EBDC" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium py-1" style={{ color: "#2A3B34" }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "rgba(15,31,26,0.10)" }}>
            <Link href={`/${locale}/login`} className="text-center text-[14px] font-medium py-2 rounded-full" style={{ color: "#0F1F1A", background: "rgba(15,31,26,0.06)" }}>
              Entrar
            </Link>
            <Link href={`/${locale}/register/empresa`} className="text-center text-[14px] font-semibold py-2.5 rounded-full" style={{ background: "#1F6B4D", color: "#F2EBDC" }}>
              Empezar gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
