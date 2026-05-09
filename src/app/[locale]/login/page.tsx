"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SpaceBackground } from "@/components/3d/SpaceBackground"
import { LanguageSwitcher } from "@/components/language-switcher"
import { QrCode, Lock, Mail, Zap } from "lucide-react"

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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <SpaceBackground minimal />

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <QrCode className="h-6 w-6 text-purple-400" />
          </div>
          <span className="font-bold text-2xl text-white">Incentivos</span>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-1">{t("login")}</h1>
          <p className="text-slate-400 text-sm mb-8">
            {t("no_account")}{" "}
            <Link href={`/${locale}/register/captador`} className="text-purple-400 hover:text-purple-300 transition-colors">
              {t("register")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-purple-500/20"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">{t("password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 font-semibold transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />{t("logging_in")}</span>
              ) : (
                <span className="flex items-center gap-2"><Zap className="h-4 w-4" />{t("login")}</span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-slate-500">
            {t("or_register_as")}{" "}
            <Link href={`/${locale}/register/empresa`} className="text-cyan-400 hover:text-cyan-300 transition-colors">
              {t("register_empresa")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
