"use client"

import { useState, useEffect } from "react"
import { Cookie, X } from "lucide-react"
import Link from "next/link"

const STORAGE_KEY = "incentis_cookie_consent"

type Consent = "all" | "essential" | null

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | "loading">("loading")
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent
    setConsent(stored ?? null)
  }, [])

  const accept = (choice: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, choice)
    setConsent(choice)
  }

  if (consent !== null) return null

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(600px, calc(100vw - 32px))",
        background: "oklch(0.19 0.015 250)",
        border: "1px solid oklch(0.30 0.02 250)",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
        padding: "20px 24px",
        zIndex: 9999,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(43,212,154,0.10)",
            border: "1px solid rgba(43,212,154,0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Cookie style={{ width: 18, height: 18, color: "#2bd49a" }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#ffffff", fontWeight: 600, fontSize: 14, margin: 0, lineHeight: 1.4 }}>
            Usamos cookies
          </p>
          <p style={{ color: "oklch(0.62 0.01 250)", fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>
            Usamos cookies esenciales para que la plataforma funcione.
            {expanded && (
              <span>
                {" "}Las cookies esenciales gestionan tu sesión de usuario (NextAuth) y no pueden desactivarse.
                No usamos cookies de publicidad ni rastreo de terceros.
              </span>
            )}
            {!expanded && (
              <>
                <button
                  onClick={() => setExpanded(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2bd49a",
                    fontSize: 13,
                    cursor: "pointer",
                    padding: 0,
                    marginLeft: 4,
                    textDecoration: "underline",
                  }}
                >
                  Más info
                </button>
                {" · "}
                <Link href="/es/privacidad" style={{ color: "#2bd49a", fontSize: 13 }}>Política de privacidad</Link>
              </>
            )}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => accept("all")}
              style={{
                background: "#2bd49a",
                color: "#0c0c0a",
                border: "none",
                borderRadius: 999,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Aceptar todas
            </button>
            <button
              onClick={() => accept("essential")}
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "oklch(0.72 0.01 250)",
                border: "1px solid oklch(0.30 0.02 250)",
                borderRadius: 999,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Solo esenciales
            </button>
          </div>
        </div>

        {/* Dismiss (solo esenciales silencioso) */}
        <button
          onClick={() => accept("essential")}
          aria-label="Cerrar"
          style={{
            flexShrink: 0,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid oklch(0.30 0.02 250)",
            borderRadius: 8,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "oklch(0.62 0.01 250)",
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )
}
