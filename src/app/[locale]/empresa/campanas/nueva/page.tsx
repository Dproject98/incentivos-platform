"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Euro, TrendingUp, Gift, Calendar, Hash, FileText, Zap } from "lucide-react"
import Link from "next/link"

export default function NuevaCampanaPage() {
  const t = useTranslations("empresa.campaigns")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [form, setForm] = useState({
    title: "",
    description: "",
    incentiveType: "FIXED",
    incentiveValue: "",
    bonusDescription: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    maxReservations: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        incentiveValue: Number(form.incentiveValue),
        maxReservations: form.maxReservations ? Number(form.maxReservations) : undefined,
        endDate: form.endDate || undefined,
        bonusDescription: form.bonusDescription || undefined,
      }),
    })
    if (!res.ok) { toast.error("Error al crear la campaña"); setLoading(false); return }
    toast.success("Campaña creada con éxito")
    router.push(`/${locale}/empresa/campanas`)
  }

  const incentiveTypes = [
    { value: "FIXED",      icon: Euro,       label: "Fijo (€ por reserva)" },
    { value: "PERCENTAGE", icon: TrendingUp,  label: "Porcentaje del ticket" },
    { value: "BONO",       icon: Gift,        label: "Bono / Voucher" },
  ]

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/empresa/campanas`}>
          <button className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-white">{t("create")}</h1>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("campaign_title")}</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Cena romántica en La Terraza"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("description")}</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe tu campaña..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50 resize-none"
              />
            </div>
          </div>

          {/* Incentive type */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("incentive_type")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {incentiveTypes.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, incentiveType: value })}
                  className={`p-3 rounded-xl border text-sm text-left transition-all ${
                    form.incentiveType === value
                      ? "border-cyan-500/40 bg-cyan-500/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/8"
                  }`}
                >
                  <Icon className={`h-4 w-4 mb-1.5 ${form.incentiveType === value ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Incentive value / bonus desc */}
          {form.incentiveType !== "BONO" ? (
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{t("incentive_value")}</Label>
              <div className="relative">
                {form.incentiveType === "FIXED" ? (
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                ) : (
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                )}
                <Input
                  type="number" min={0.1} step={0.1} required
                  value={form.incentiveValue}
                  onChange={(e) => setForm({ ...form, incentiveValue: e.target.value })}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{t("bonus_description")}</Label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  required
                  value={form.bonusDescription}
                  onChange={(e) => setForm({ ...form, bonusDescription: e.target.value })}
                  placeholder="Ej: Cena para 2 personas"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                />
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{t("start_date")}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="date" required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="pl-10 bg-white/5 border-white/10 text-white focus:border-cyan-500/50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{t("end_date")}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="date"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="pl-10 bg-white/5 border-white/10 text-white focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Max reservations */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("max_reservations")}</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="number" min={1}
                value={form.maxReservations}
                onChange={(e) => setForm({ ...form, maxReservations: e.target.value })}
                placeholder="Sin límite"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Creando..." : <><Zap className="h-4 w-4" />{t("create")}</>}
          </button>
        </form>
      </div>
    </div>
  )
}
