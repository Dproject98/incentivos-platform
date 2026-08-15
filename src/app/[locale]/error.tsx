"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[error boundary]", error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "oklch(0.15 0.012 250)", color: "#ffffff" }}
    >
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.20)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1
        className="font-semibold mb-2"
        style={{ fontSize: "clamp(18px,3vw,24px)", letterSpacing: "-0.03em" }}
      >
        Algo ha ido mal
      </h1>
      <p className="mb-6 max-w-xs text-[14px]" style={{ color: "oklch(0.62 0.01 250)" }}>
        Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-full font-semibold text-[14px] transition-opacity hover:opacity-80"
        style={{ background: "#2bd49a", color: "#0c0c0a" }}
      >
        Reintentar
      </button>
      {error.digest && (
        <p className="mt-4 text-[11px] font-mono" style={{ color: "oklch(0.40 0.01 250)" }}>
          ref: {error.digest}
        </p>
      )}
    </div>
  )
}
