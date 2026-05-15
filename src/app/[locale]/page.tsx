import { getTranslations, getLocale } from "next-intl/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SpaceBackground } from "@/components/3d/SpaceBackground"
import {
  QrCode, Shield, Megaphone, CalendarCheck, Wallet,
  Hotel, UtensilsCrossed, ShoppingBag, Star, ArrowRight,
  Zap, Trophy, Users,
} from "lucide-react"

export default async function LandingPage() {
  const t = await getTranslations("landing")
  const locale = await getLocale()

  const steps = [
    { icon: Megaphone, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", ...t.raw("how.step1") as { title: string; desc: string } },
    { icon: Shield,    color: "text-pink-400",   bg: "bg-pink-500/10 border-pink-500/20",     ...t.raw("how.step2") as { title: string; desc: string } },
    { icon: CalendarCheck, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20",   ...t.raw("how.step3") as { title: string; desc: string } },
    { icon: Wallet,    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  ...t.raw("how.step4") as { title: string; desc: string } },
  ]

  const businessTypes = [
    { icon: Hotel,           label: t("types.hotel"),      color: "#7c3aed" },
    { icon: UtensilsCrossed, label: t("types.restaurant"), color: "#ec4899" },
    { icon: ShoppingBag,     label: t("types.retail"),     color: "#06b6d4" },
    { icon: Star,            label: t("types.services"),   color: "#10b981" },
  ]

  const tiers = [
    { label: "Bronze",   color: "from-amber-900 to-amber-600",   glow: "rgba(139,105,20,0.5)",  value: "5€" },
    { label: "Silver",   color: "from-slate-400 to-slate-200",   glow: "rgba(192,192,192,0.5)", value: "15€" },
    { label: "Gold",     color: "from-yellow-600 to-yellow-300", glow: "rgba(255,215,0,0.5)",   value: "30€" },
    { label: "Platinum", color: "from-slate-300 to-white",       glow: "rgba(229,228,226,0.5)", value: "50€+" },
  ]

  return (
    <div className="min-h-screen relative text-foreground overflow-hidden">
      {/* 3D Space background */}
      <SpaceBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 glass-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-purple-400" />
            </div>
            <span className="font-bold text-lg text-white">Incentivos</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href={`/${locale}/login`} className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
                Acceder
              </Button>
            </Link>
            <Link href={`/${locale}/register/captador`}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white glow-purple border-0 text-xs sm:text-sm px-3 sm:px-4">
                Comenzar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
        <Badge className="mb-6 px-4 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm">
          ✨ {t("hero.badge")}
        </Badge>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
          <span className="text-white">{locale === "es" ? "Capta clientes." : "Refer clients."}</span>
          <br />
          <span className="gradient-text">{locale === "es" ? "Gana recompensas." : "Earn rewards."}</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href={`/${locale}/register/empresa`}>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-200 transition-all"
            >
              {t("hero.cta_empresa")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/${locale}/register/captador`}>
            <Button
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-glow-purple transition-all hover:scale-105"
            >
              <Zap className="mr-2 h-4 w-4" />
              {t("hero.cta_captador")}
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500">{t("hero.trusted")}</p>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: "100%", label: "Anónimo" },
            { value: "QR", label: "Validación simple" },
            { value: "€€€", label: "Incentivos reales" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 border-gradient">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-24 bg-space-panel/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t("how.title")}</h2>
            <div className="h-0.5 w-20 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto" />
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className={`glass rounded-2xl p-6 border ${step.bg} flex flex-col items-center text-center gap-4 hover:scale-105 transition-transform`}>
                  <div className={`h-14 w-14 rounded-2xl ${step.bg} border flex items-center justify-center`}>
                    <Icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tier system */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="gradient-text-gold">Niveles de incentivo</span>
            </h2>
            <p className="text-slate-400">Cuantas más reservas confirmes, mayor es tu recompensa</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {tiers.map((tier, i) => (
              <div
                key={tier.label}
                className="glass rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300 cursor-pointer float"
                style={{ animationDelay: `${i * 0.5}s`, boxShadow: `0 0 30px ${tier.glow}` }}
              >
                <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${tier.color} mx-auto mb-4 shadow-lg`} />
                <div className="font-bold text-white text-lg">{tier.label}</div>
                <div className="gradient-text text-2xl font-bold mt-1">{tier.value}</div>
                <div className="text-xs text-slate-500 mt-1">por reserva</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business types */}
      <section className="relative z-10 py-24 bg-space-panel/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">{t("types.title")}</h2>
          <p className="text-slate-400 mb-12">Cualquier negocio, cualquier sector</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {businessTypes.map((bt, i) => {
              const Icon = bt.icon
              return (
                <div
                  key={i}
                  className="glass rounded-2xl p-6 flex flex-col items-center gap-3 hover:scale-105 transition-all cursor-pointer border border-white/5 hover:border-white/15"
                >
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center" style={{ background: `${bt.color}20`, border: `1px solid ${bt.color}40` }}>
                    <Icon className="h-7 w-7" style={{ color: bt.color }} />
                  </div>
                  <span className="text-sm font-medium text-white">{bt.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features highlight */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass rounded-3xl p-12 border-gradient text-center space-y-8">
            <div className="flex justify-center gap-6">
              <Trophy className="h-10 w-10 text-yellow-400 float" />
              <Users className="h-10 w-10 text-purple-400 float" style={{ animationDelay: "1s" }} />
              <Shield className="h-10 w-10 text-cyan-400 float" style={{ animationDelay: "2s" }} />
            </div>
            <h2 className="text-4xl font-bold text-white">
              ¿Listo para el universo de incentivos?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Únete ahora y empieza a ganar recompensas por cada cliente que refers, o capta promotores para tu negocio hoy mismo.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href={`/${locale}/register/captador`}>
                <Button size="lg" className="h-12 px-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 glow-purple">
                  <Zap className="mr-2 h-5 w-5" />
                  {t("hero.cta_captador")}
                </Button>
              </Link>
              <Link href={`/${locale}/register/empresa`}>
                <Button size="lg" variant="outline" className="h-12 px-10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10">
                  {t("hero.cta_empresa")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Incentivos Platform · Todos los derechos reservados
      </footer>
    </div>
  )
}
