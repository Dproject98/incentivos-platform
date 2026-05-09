"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SpaceBackground } from "@/components/3d/SpaceBackground"
import { LanguageSwitcher } from "@/components/language-switcher"
import { QrCode, Shield, Euro, Zap, Mail, Lock, User, Phone } from "lucide-react"

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
    { icon: Shield, label: "100% anónimo", color: "text-green-400" },
    { icon: QrCode,  label: "QR automático", color: "text-cyan-400" },
    { icon: Euro,    label: "Incentivos reales", color: "text-yellow-400" },
  ]

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <SpaceBackground minimal />
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <QrCode className="h-6 w-6 text-purple-400" />
          </div>
          <span className="font-bold text-2xl text-white">Incentivos</span>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {perks.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.label} className="glass rounded-xl p-3 text-center border border-white/5">
                <Icon className={`h-5 w-5 ${p.color} mx-auto mb-1`} />
                <span className="text-xs text-slate-400">{p.label}</span>
              </div>
            )
          })}
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-1">{t("register_captador")}</h1>
          <p className="text-slate-400 text-sm mb-8">{t("captador_desc")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { field: "name",     icon: User,  type: "text",     placeholder: "Tu nombre completo",    label: t("name") },
              { field: "email",    icon: Mail,  type: "email",    placeholder: "tu@email.com",          label: t("email") },
              { field: "phone",    icon: Phone, type: "tel",      placeholder: "+34 600 000 000",       label: t("phone") },
              { field: "password", icon: Lock,  type: "password", placeholder: "Mínimo 6 caracteres",  label: t("password") },
            ].map(({ field, icon: Icon, type, placeholder, label }) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-slate-300 text-sm">{label}</Label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type={type}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required={field !== "phone"}
                    placeholder={placeholder}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50"
                  />
                </div>
              </div>
            ))}

            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 font-semibold"
              disabled={loading}
            >
              {loading ? t("registering") : <span className="flex items-center gap-2"><Zap className="h-4 w-4" />{t("register")}</span>}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {t("have_account")}{" "}
            <Link href={`/${locale}/login`} className="text-purple-400 hover:text-purple-300">{t("login")}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
