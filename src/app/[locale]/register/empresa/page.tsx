"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LanguageSwitcher } from "@/components/language-switcher"
import { IncentisLogo } from "@/components/IncentisLogo"

const BUSINESS_TYPES = [
  { value: "hotel",       label: "Hotel / Alojamiento" },
  { value: "restaurante", label: "Restaurante / Bar" },
  { value: "retail",      label: "Comercio / Tienda" },
  { value: "servicios",   label: "Servicios / Experiencias" },
  { value: "otro",        label: "Otro" },
]

const inputStyle = {
  background: "oklch(0.22 0.015 250)",
  border: "1px solid oklch(0.30 0.02 250)",
  color: "#ffffff",
}

export default function RegisterEmpresaPage() {
  const t = useTranslations("auth")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    businessName: "", businessType: "", businessAddress: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.businessType) { toast.error(t("errors.required")); return }
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "EMPRESA" }),
    })

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error === "email_taken" ? t("errors.email_taken") : t("errors.required"))
      setLoading(false)
      return
    }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push(`/${locale}/empresa/dashboard`)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "#2bd49a")
  const handleBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "oklch(0.30 0.02 250)")

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "oklch(0.15 0.012 250)" }}>
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex justify-center mb-8">
          <IncentisLogo size="md" />
        </Link>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          <h1
            className="font-semibold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "22px", letterSpacing: "-0.03em" }}
          >
            {t("register_empresa")}
          </h1>
          <p className="text-[14px] mb-7" style={{ color: "oklch(0.62 0.01 250)" }}>{t("empresa_desc")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sección: Datos personales */}
            <p
              className="text-[10px] uppercase tracking-[0.12em] font-mono pt-1"
              style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)" }}
            >
              Datos personales
            </p>

            {[
              { key: "name",     type: "text",     placeholder: "Tu nombre completo",   label: t("name") },
              { key: "email",    type: "email",    placeholder: "tu@empresa.com",       label: t("email") },
              { key: "password", type: "password", placeholder: "Mínimo 6 caracteres", label: t("password") },
            ].map(({ key, type, placeholder, label }) => (
              <div key={key}>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>{label}</label>
                <input
                  type={type}
                  required
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            ))}

            {/* Sección: Datos del negocio */}
            <p
              className="text-[10px] uppercase tracking-[0.12em] font-mono pt-3 border-t"
              style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)", borderColor: "oklch(0.30 0.02 250)" }}
            >
              Datos del negocio
            </p>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>{t("business_name")}</label>
              <input
                type="text"
                required
                placeholder="Nombre de tu negocio"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>{t("business_type")}</label>
              <Select value={form.businessType} onValueChange={(v) => setForm({ ...form, businessType: v ?? "" })}>
                <SelectTrigger
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] h-auto outline-none"
                  style={{ ...inputStyle, boxShadow: "none" }}
                >
                  <SelectValue placeholder="Selecciona tipo..." />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border"
                  style={{ background: "oklch(0.22 0.015 250)", borderColor: "oklch(0.30 0.02 250)", color: "#ffffff" }}
                >
                  {BUSINESS_TYPES.map((bt) => (
                    <SelectItem
                      key={bt.value}
                      value={bt.value}
                      className="text-[14px] rounded-lg cursor-pointer"
                      style={{ color: "#ffffff" }}
                    >
                      {bt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>{t("business_address")}</label>
              <input
                type="text"
                placeholder="Dirección del negocio"
                value={form.businessAddress}
                onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

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
          ¿Eres captador?{" "}
          <Link href={`/${locale}/register/captador`} className="font-medium" style={{ color: "#2bd49a" }}>
            Regístrate para captar
          </Link>
        </p>
      </div>
    </div>
  )
}
