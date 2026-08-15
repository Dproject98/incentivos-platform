"use client"

import { useState, Suspense } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { IncentisLogo } from "@/components/IncentisLogo"
import { CheckCircle, AlertCircle } from "lucide-react"

function ResetPasswordForm() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = params.locale as string
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputStyle = {
    background: "oklch(0.22 0.015 250)",
    border: "1px solid oklch(0.30 0.02 250)",
    color: "#ffffff",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (data.error === "invalid_or_expired_token") {
        setError("El enlace ha expirado o no es válido. Solicita uno nuevo.")
      } else {
        setError("Ha ocurrido un error. Inténtalo de nuevo.")
      }
      return
    }

    setDone(true)
    setTimeout(() => router.push(`/${locale}/login`), 3000)
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: "#dc2626" }} />
        <p className="font-medium" style={{ color: "#ffffff" }}>Enlace inválido</p>
        <p className="text-[13px] mt-1 mb-4" style={{ color: "oklch(0.62 0.01 250)" }}>
          Este enlace no es válido. Solicita uno nuevo.
        </p>
        <Link href={`/${locale}/login/forgot-password`} className="text-[14px] font-medium" style={{ color: "#2bd49a" }}>
          Solicitar enlace
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "oklch(0.80 0.17 162 / 0.08)", border: "1px solid oklch(0.80 0.17 162 / 0.20)" }}>
          <CheckCircle className="h-7 w-7" style={{ color: "#2bd49a" }} />
        </div>
        <h2 className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "20px", letterSpacing: "-0.03em" }}>
          Contraseña restablecida
        </h2>
        <p className="text-[14px]" style={{ color: "oklch(0.62 0.01 250)" }}>
          Redirigiendo al inicio de sesión...
        </p>
      </div>
    )
  }

  return (
    <>
      <h1 className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "20px", letterSpacing: "-0.03em" }}>
        Nueva contraseña
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "oklch(0.62 0.01 250)" }}>
        Elige una contraseña de al menos 8 caracteres.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>
            Nueva contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2bd49a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.30 0.02 250)")}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>
            Confirmar contraseña
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2bd49a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.30 0.02 250)")}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl text-[13px]"
            style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.20)", color: "#dc2626" }}>
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-60 hover:opacity-90"
          style={{ background: "#2bd49a", color: "#0c0c0a" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Guardando...
            </span>
          ) : "Guardar contraseña"}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "oklch(0.15 0.012 250)" }}>
      <div className="w-full max-w-md">
        <Link href={`/${locale}`} className="flex justify-center mb-8">
          <IncentisLogo size="md" />
        </Link>
        <div className="rounded-2xl p-8" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          <Suspense fallback={<div className="flex justify-center py-8"><div className="h-6 w-6 rounded-full border-2 animate-spin" style={{ borderColor: "oklch(0.80 0.17 162 / 0.20)", borderTopColor: "#2bd49a" }} /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
