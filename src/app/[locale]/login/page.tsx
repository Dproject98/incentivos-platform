"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { toast } from "sonner"
import { LanguageSwitcher } from "@/components/language-switcher"
import { IncentisLogo } from "@/components/IncentisLogo"

export default function LoginPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await signIn("credentials", { email, password, redirect: false })

    if (result?.error) {
      toast.error(t("errors.invalid_credentials"))
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/session")
    const session = await res.json()
    const role = session?.user?.role

    if (role === "EMPRESA") router.push(`/${locale}/empresa/dashboard`)
    else if (role === "CAPTADOR") router.push(`/${locale}/captador/dashboard`)
    else router.push(`/${locale}`)
  }

  const inputStyle = {
    background: "#F2EBDC",
    border: "1px solid rgba(15,31,26,0.15)",
    color: "#0F1F1A",
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F2EBDC" }}>
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex justify-center mb-8">
          <IncentisLogo size="md" />
        </Link>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.10)" }}>
          <h1
            className="font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "22px", letterSpacing: "-0.03em" }}
          >
            {t("login")}
          </h1>
          <p className="text-[14px] mb-7" style={{ color: "#88B5A2" }}>
            {t("no_account")}{" "}
            <Link href={`/${locale}/register/captador`} className="font-medium" style={{ color: "#1F6B4D" }}>
              {t("register")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1F6B4D")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1F6B4D")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-[15px] font-semibold mt-2 transition-opacity disabled:opacity-60 hover:opacity-90"
              style={{ background: "#1F6B4D", color: "#F2EBDC" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t("logging_in")}
                </span>
              ) : t("login")}
            </button>
          </form>

          <div
            className="mt-6 pt-6 border-t text-center text-[13px]"
            style={{ borderColor: "rgba(15,31,26,0.08)", color: "#88B5A2" }}
          >
            {t("or_register_as")}{" "}
            <Link href={`/${locale}/register/empresa`} className="font-medium" style={{ color: "#1F6B4D" }}>
              {t("register_empresa")}
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-[12px]" style={{ color: "#88B5A2" }}>
          ¿Primera vez?{" "}
          <Link href={`/${locale}/register/captador`} className="font-medium" style={{ color: "#1F6B4D" }}>
            Crear cuenta captador
          </Link>
          {" · "}
          <Link href={`/${locale}/register/empresa`} className="font-medium" style={{ color: "#1F6B4D" }}>
            Registrar empresa
          </Link>
        </p>
      </div>
    </div>
  )
}
