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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SpaceBackground } from "@/components/3d/SpaceBackground"
import { LanguageSwitcher } from "@/components/language-switcher"
import { QrCode, Building2, Mail, Lock, User, MapPin, Zap, Briefcase } from "lucide-react"

const BUSINESS_TYPES = [
  { value: "hotel",       label: "Hotel / Alojamiento" },
  { value: "restaurante", label: "Restaurante / Bar" },
  { value: "retail",      label: "Comercio / Tienda" },
  { value: "servicios",   label: "Servicios / Experiencias" },
  { value: "otro",        label: "Otro" },
]

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

  const f = (field: string) => ({
    value: form[field as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value }),
  })

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <SpaceBackground minimal />
      <div className="absolute top-4 right-4 z-20"><LanguageSwitcher /></div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <QrCode className="h-6 w-6 text-cyan-400" />
          </div>
          <span className="font-bold text-2xl text-white">Incentis</span>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-1">{t("register_empresa")}</h1>
          <p className="text-slate-400 text-sm mb-8">{t("empresa_desc")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal info */}
            <div className="space-y-4">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Datos personales</p>
              {[
                { field: "name",     icon: User,  type: "text",     placeholder: "Tu nombre completo",   label: t("name") },
                { field: "email",    icon: Mail,  type: "email",    placeholder: "tu@empresa.com",       label: t("email") },
                { field: "password", icon: Lock,  type: "password", placeholder: "Mínimo 6 caracteres", label: t("password") },
              ].map(({ field, icon: Icon, type, placeholder, label }) => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">{label}</Label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type={type}
                      required
                      placeholder={placeholder}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                      {...f(field)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Business info */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <p className="text-xs text-slate-500 uppercase tracking-widest">Datos del negocio</p>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">{t("business_name")}</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    required
                    placeholder="Nombre de tu negocio"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                    {...f("businessName")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">{t("business_type")}</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                  <Select value={form.businessType} onValueChange={(v) => setForm({ ...form, businessType: v })}>
                    <SelectTrigger className="pl-10 bg-white/5 border-white/10 text-white focus:border-cyan-500/50">
                      <SelectValue placeholder="Selecciona tipo..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1332] border-white/10 text-white">
                      {BUSINESS_TYPES.map((bt) => (
                        <SelectItem key={bt.value} value={bt.value} className="focus:bg-cyan-500/20">
                          {bt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">{t("business_address")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Dirección del negocio"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                    {...f("businessAddress")}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 font-semibold"
              disabled={loading}
            >
              {loading ? t("registering") : (
                <span className="flex items-center gap-2"><Zap className="h-4 w-4" />{t("register")}</span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {t("have_account")}{" "}
            <Link href={`/${locale}/login`} className="text-cyan-400 hover:text-cyan-300">{t("login")}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
