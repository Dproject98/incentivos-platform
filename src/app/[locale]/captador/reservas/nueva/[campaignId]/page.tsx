"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mail, MessageCircle, Download, User, AtSign, Phone, Calendar, Clock, Users, FileText, Euro, Gift, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

interface Campaign {
  id: string
  title: string
  incentiveType: string
  incentiveValue: number
  bonusDescription: string | null
  business: { name: string }
}

export default function NuevaReservaPage() {
  const t = useTranslations("captador.reservations")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const campaignId = params.campaignId as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    date: "", time: "20:00", guests: 2, notes: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((campaigns: Campaign[]) => {
        const c = campaigns.find((c) => c.id === campaignId)
        if (c) setCampaign(c)
      })
  }, [campaignId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, campaignId, guests: Number(form.guests) }),
    })
    if (!res.ok) { toast.error("Error al crear la reserva"); setLoading(false); return }
    const reservation = await res.json()
    toast.success(t("qr_sent"), { duration: 5000 })
    router.push(`/${locale}/captador/reservas/${reservation.id}`)
  }

  const incentiveText = campaign
    ? campaign.incentiveType === "BONO"
      ? campaign.bonusDescription
      : campaign.incentiveType === "PERCENTAGE"
      ? `${campaign.incentiveValue}% por reserva confirmada`
      : `${campaign.incentiveValue}€ por reserva confirmada`
    : null

  const IncentiveIcon = campaign
    ? { FIXED: Euro, PERCENTAGE: TrendingUp, BONO: Gift }[campaign.incentiveType] ?? Euro
    : Euro

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/captador/campanas`}>
          <button className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-white">{t("new")}</h1>
      </div>

      {/* Campaign banner */}
      {campaign && (
        <div className="glass rounded-2xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{campaign.title}</p>
              <p className="text-sm text-slate-400">{campaign.business.name}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
              <IncentiveIcon className="h-4 w-4" />
              {incentiveText}
            </div>
          </div>
        </div>
      )}

      {/* QR delivery info */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-purple-400" /> QR enviado por email</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-green-400" /> QR por WhatsApp</span>
        <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-cyan-400" /> Descargable</span>
      </div>

      {/* Form */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <h2 className="text-sm text-slate-400 uppercase tracking-widest mb-5">Datos del cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { field: "clientName",  icon: User,    type: "text",  placeholder: "Nombre completo",    label: t("client_name"),  required: true },
            { field: "clientEmail", icon: AtSign,  type: "email", placeholder: "email@cliente.com",  label: t("client_email"), required: true },
            { field: "clientPhone", icon: Phone,   type: "tel",   placeholder: "+34 600 000 000",     label: t("client_phone"), required: true },
          ].map(({ field, icon: Icon, type, placeholder, label, required }) => (
            <div key={field} className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{label}</Label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type={type}
                  required={required}
                  placeholder={placeholder}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50"
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{t("date")}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="pl-10 bg-white/5 border-white/10 text-white focus:border-purple-500/50"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">{t("time")}</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="time"
                  required
                  className="pl-10 bg-white/5 border-white/10 text-white focus:border-purple-500/50"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("guests")}</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="number" min={1} max={50} required
                className="pl-10 bg-white/5 border-white/10 text-white focus:border-purple-500/50"
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("notes")}</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Textarea
                rows={3}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 resize-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 font-semibold"
            disabled={loading}
          >
            {loading ? t("submitting") : (
              <span className="flex items-center gap-2"><Zap className="h-4 w-4" />{t("submit")}</span>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
