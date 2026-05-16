"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { toast } from "sonner"
import { LanguageSwitcher } from "@/components/language-switcher"
import { IncentisLogo } from "@/components/IncentisLogo"

export default function RegisterCaptadorPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "CAPTADOR" }),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error === "email_taken" ? t("errors.email_taken") : t("errors.required"))
      setLoading(false)
      return
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push(`/${locale}/captador/dashboard`)
  }

  const perks = [
    { label: "100% anónimo",      symbol: "✦" },
    { label: "QR automático",     symbol: "◈" },
    { label: "Incentivos reales", symbol: "€" },
  ]

  const fields = [
    { key: "name",     type: "text",     placeholder: "Tu nombre completo",   label: t("name"),     required: true },
    { key: "email",    type: "email",    placeholder: "tu@email.com",         label: t("email"),    required: true },
    { key: "phone",    type: "tel",      placeholder: "+34 600 000 000",      label: t("phone"),    required: false },
    { key: "password", type: "password", placeholder: "Mínimo 6 caracteres", label: t("password"), required: true },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#F2EBDC" }}>
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex justify-center mb-8">
          <IncentisLogo size="md" />
        </Link>

        {/* Perks */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {perks.map((p) => (
            <div
              key={p.label}
              className="rounded-xl px-3 py-3 text-center"
              style={{ background: "rgba(31,107,77,0.07)", border: "1px solid rgba(31,107,77,0.15)" }}
            >
              <span className="block text-[16px] mb-1" style={{ color: "#D88B2E" }}>{p.symbol}</span>
              <span className="text-[11px] font-medium" style={{ color: "#1F6B4D" }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.10)" }}>
          <h1
            className="font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "22px", letterSpacing: "-0.03em" }}
          >
            {t("register_captador")}
          </h1>
          <p className="text-[14px] mb-7" style={{ color: "#88B5A2" }}>{t("captador_desc")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, type, placeholder, label, required }) => (
              <div key={key}>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={required}
                  placeholder={placeholder}
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                  style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.15)", color: "#0F1F1A" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#1F6B4D")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-[15px] font-semibold mt-2 transition-opacity disabled:opacity-60 hover:opacity-90"
              style={{ background: "#1F6B4D", color: "#F2EBDC" }}
            >
              {loading ? t("registering") : t("register")}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px]" style={{ color: "#88B5A2" }}>
            {t("have_account")}{" "}
            <Link href={`/${locale}/login`} className="font-medium" style={{ color: "#1F6B4D" }}>
              {t("login")}
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-[12px]" style={{ color: "#88B5A2" }}>
          ¿Eres empresa?{" "}
          <Link href={`/${locale}/register/empresa`} className="font-medium" style={{ color: "#1F6B4D" }}>
            Registra tu negocio
          </Link>
        </p>
      </div>
    </div>
  )
}
