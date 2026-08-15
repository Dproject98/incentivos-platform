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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "oklch(0.15 0.012 250)" }}>
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
              style={{ background: "oklch(0.80 0.17 162 / 0.07)", border: "1px solid oklch(0.80 0.17 162 / 0.15)" }}
            >
              <span className="block text-[16px] mb-1" style={{ color: "#2bd49a" }}>{p.symbol}</span>
              <span className="text-[11px] font-medium" style={{ color: "#2bd49a" }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          <h1
            className="font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "22px", letterSpacing: "-0.03em" }}
          >
            {t("register_captador")}
          </h1>
          <p className="text-[14px] mb-7" style={{ color: "oklch(0.62 0.01 250)" }}>{t("captador_desc")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, type, placeholder, label, required }) => (
              <div key={key}>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={required}
                  placeholder={placeholder}
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                  style={{ background: "oklch(0.22 0.015 250)", border: "1px solid oklch(0.30 0.02 250)", color: "#ffffff" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#2bd49a")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.30 0.02 250)")}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-[15px] font-semibold mt-2 transition-opacity disabled:opacity-60 hover:opacity-90"
              style={{ background: "#2bd49a", color: "#0c0c0a" }}
            >
              {loading ? t("registering") : t("register")}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px]" style={{ color: "oklch(0.62 0.01 250)" }}>
            {t("have_account")}{" "}
            <Link href={`/${locale}/login`} className="font-medium" style={{ color: "#2bd49a" }}>
              {t("login")}
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>
          ¿Eres empresa?{" "}
          <Link href={`/${locale}/register/empresa`} className="font-medium" style={{ color: "#2bd49a" }}>
            Registra tu negocio
          </Link>
        </p>
      </div>
    </div>
  )
}
