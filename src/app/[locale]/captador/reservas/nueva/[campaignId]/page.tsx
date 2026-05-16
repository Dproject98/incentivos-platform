"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ArrowLeft, Mail, MessageCircle, Download, User, AtSign, Phone, Calendar, Clock, Users, FileText, Euro, Gift, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

interface Campaign {
  id: string
  title: string
  incentiveTypes: string[]
  incentiveValue: number
  bonusDescription: string | null
  business: { name: string }
}

const inputStyle = {
  background: "#F2EBDC",
  border: "1px solid rgba(15,31,26,0.15)",
  color: "#0F1F1A",
}

const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = "#1F6B4D")
const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")

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
    ? [
        campaign.incentiveTypes.includes("FIXED") ? `${campaign.incentiveValue}€ por reserva confirmada` : null,
        campaign.incentiveTypes.includes("PERCENTAGE") ? `${campaign.incentiveValue}% por reserva confirmada` : null,
        campaign.incentiveTypes.includes("BONO") ? (campaign.bonusDescription ?? "Bono") : null,
      ].filter(Boolean).join(" + ")
    : null

  const iconMap: Record<string, typeof Euro> = { FIXED: Euro, PERCENTAGE: TrendingUp, BONO: Gift }
  const primaryType = campaign?.incentiveTypes.find((t) => t !== "BONO") ?? campaign?.incentiveTypes[0] ?? "FIXED"
  const IncentiveIcon = iconMap[primaryType] ?? Euro

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/captador/campanas`}>
          <button
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background: "rgba(15,31,26,0.06)", border: "1px solid rgba(15,31,26,0.10)" }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: "#0F1F1A" }} />
          </button>
        </Link>
        <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "22px", letterSpacing: "-0.03em" }}>
          {t("new")}
        </h1>
      </div>

      {/* Campaign banner */}
      {campaign && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between gap-3"
          style={{ background: "rgba(31,107,77,0.06)", border: "1px solid rgba(31,107,77,0.15)" }}
        >
          <div>
            <p className="font-semibold text-[14px]" style={{ color: "#0F1F1A" }}>{campaign.title}</p>
            <p className="text-[13px]" style={{ color: "#88B5A2" }}>{campaign.business.name}</p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-medium shrink-0"
            style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D", border: "1px solid rgba(31,107,77,0.20)" }}
          >
            <IncentiveIcon className="h-4 w-4" />
            {incentiveText}
          </div>
        </div>
      )}

      {/* QR delivery info */}
      <div className="flex items-center gap-4 text-[12px]" style={{ color: "#88B5A2" }}>
        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" style={{ color: "#1F6B4D" }} /> QR por email</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" style={{ color: "#1F6B4D" }} /> QR por WhatsApp</span>
        <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" style={{ color: "#88B5A2" }} /> Descargable</span>
      </div>

      {/* Form */}
      <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
        <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-5" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          Datos del cliente
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { field: "clientName",  icon: User,   type: "text",  placeholder: "Nombre completo",   label: t("client_name"),  required: true },
            { field: "clientEmail", icon: AtSign, type: "email", placeholder: "email@cliente.com", label: t("client_email"), required: true },
            { field: "clientPhone", icon: Phone,  type: "tel",   placeholder: "+34 600 000 000",   label: t("client_phone"), required: true },
          ].map(({ field, icon: Icon, type, placeholder, label, required }) => (
            <div key={field}>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#88B5A2" }} />
                <input
                  type={type}
                  required={required}
                  placeholder={placeholder}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-[14px] outline-none transition-colors"
                  style={inputStyle}
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" style={{ color: "#88B5A2" }} />{t("date")}</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" style={{ color: "#88B5A2" }} />{t("time")}</span>
              </label>
              <input
                type="time"
                required
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" style={{ color: "#88B5A2" }} />{t("guests")}</span>
            </label>
            <input
              type="number" min={1} max={50} required
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
              style={inputStyle}
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" style={{ color: "#88B5A2" }} />{t("notes")}</span>
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors resize-none"
              style={inputStyle}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "#1F6B4D", color: "#F2EBDC" }}
          >
            {loading ? t("submitting") : (
              <><Zap className="h-4 w-4" />{t("submit")}</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
