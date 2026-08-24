"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { IncentisLogo } from "@/components/IncentisLogo"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const params = useParams()
  const locale = params.locale as string

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const inputStyle = {
    background: "#26282C",
    border: "1px solid #34373C",
    color: "#F2F1EF",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#16171A" }}>
      <div className="w-full max-w-md">
        <Link href={`/${locale}`} className="flex justify-center mb-8">
          <IncentisLogo size="md" />
        </Link>

        <div className="rounded-2xl p-8" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
          {sent ? (
            <div className="text-center py-4">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "oklch(0.70 0.15 35 / 0.08)", border: "1px solid oklch(0.70 0.15 35 / 0.20)" }}
              >
                <CheckCircle className="h-7 w-7" style={{ color: "#E8735A" }} />
              </div>
              <h2 className="font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#F2F1EF", fontSize: "20px", letterSpacing: "-0.03em" }}>
                Email enviado
              </h2>
              <p className="text-[14px] mb-6" style={{ color: "#93979E" }}>
                Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link
                href={`/${locale}/login`}
                className="flex items-center justify-center gap-2 text-[14px] font-medium hover:opacity-80"
                style={{ color: "#E8735A" }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <Link href={`/${locale}/login`} className="hover:opacity-70">
                  <ArrowLeft className="h-5 w-5" style={{ color: "#93979E" }} />
                </Link>
                <div>
                  <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#F2F1EF", fontSize: "20px", letterSpacing: "-0.03em" }}>
                    ¿Olvidaste tu contraseña?
                  </h1>
                  <p className="text-[13px]" style={{ color: "#93979E" }}>
                    Introduce tu email y te enviaremos un enlace para recuperarla.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#F2F1EF" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="tu@email.com"
                    className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#E8735A")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#34373C")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-60 hover:opacity-90"
                  style={{ background: "#E8735A", color: "#16171A" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Enviando...
                    </span>
                  ) : "Enviar enlace"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
