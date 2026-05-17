"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ArrowLeft, Euro, TrendingUp, Gift, Calendar, Hash, FileText } from "lucide-react"
import Link from "next/link"

const inputStyle = {
  background: "#F2EBDC",
  border: "1px solid rgba(15,31,26,0.15)",
  color: "#0F1F1A",
}

export default function NuevaCampanaPage() {
  const t = useTranslations("empresa.campaigns")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [form, setForm] = useState({
    title: "",
    description: "",
    incentiveTypes: ["FIXED"] as string[],
    fixedValue: "",
    percentageValue: "",
    bonusDescription: "",
    bonusMinValue: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    maxReservations: "",
  })

  const toggleType = (value: string) => {
    setForm((prev) => {
      const current = prev.incentiveTypes
      const isSelected = current.includes(value)
      // Each type toggles independently. Keep at least one type selected.
      if (isSelected && current.length === 1) return prev
      return {
        ...prev,
        incentiveTypes: isSelected
          ? current.filter((t) => t !== value)
          : [...current, value],
      }
    })
  }
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        incentiveTypes: form.incentiveTypes,
        fixedValue: form.incentiveTypes.includes("FIXED") && form.fixedValue ? Number(form.fixedValue) : undefined,
        percentageValue: form.incentiveTypes.includes("PERCENTAGE") && form.percentageValue ? Number(form.percentageValue) : undefined,
        maxReservations: form.maxReservations ? Number(form.maxReservations) : undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        bonusDescription: form.bonusDescription || undefined,
        bonusMinValue: form.bonusMinValue ? Number(form.bonusMinValue) : undefined,
      }),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      const msg = errData.issues
        ? errData.issues.map((i: { path: string[]; message: string }) => `${i.path.join(".")}: ${i.message}`).join(" | ")
        : errData.detail ?? errData.error ?? "Error desconocido"
      toast.error(`Error al crear la campaña: ${msg}`)
      setLoading(false)
      return
    }
    toast.success("Campaña creada con éxito")
    router.push(`/${locale}/empresa/campanas`)
  }

  const incentiveTypes = [
    { value: "FIXED",      icon: Euro,       label: "Fijo (€ por reserva)" },
    { value: "PERCENTAGE", icon: TrendingUp,  label: "Porcentaje del ticket" },
    { value: "BONO",       icon: Gift,        label: "Bono / Voucher" },
  ]

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "#1F6B4D")
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/empresa/campanas`}>
          <button
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background: "rgba(15,31,26,0.06)", border: "1px solid rgba(15,31,26,0.10)" }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: "#0F1F1A" }} />
          </button>
        </Link>
        <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "22px", letterSpacing: "-0.03em" }}>
          {t("create")}
        </h1>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>{t("campaign_title")}</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Cena romántica en La Terraza"
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>{t("description")}</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4" style={{ color: "#88B5A2" }} />
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe tu campaña..."
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-[14px] outline-none transition-colors resize-none"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
          </div>

          {/* Incentive type — multi-select */}
          <div>
            <label className="block text-[13px] font-medium mb-1" style={{ color: "#0F1F1A" }}>{t("incentive_type")}</label>
            <p className="text-[12px] mb-2" style={{ color: "#88B5A2" }}>Puedes combinar varios tipos de compensación</p>
            <div className="grid grid-cols-3 gap-2">
              {incentiveTypes.map(({ value, icon: Icon, label }) => {
                const active = form.incentiveTypes.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleType(value)}
                    className="p-3 rounded-xl text-left transition-all relative"
                    style={{
                      background: active ? "rgba(31,107,77,0.08)" : "#F2EBDC",
                      border: active ? "1px solid rgba(31,107,77,0.25)" : "1px solid rgba(15,31,26,0.12)",
                      color: active ? "#1F6B4D" : "#2A3B34",
                    }}
                  >
                    <Icon className="h-4 w-4 mb-1.5" style={{ color: active ? "#1F6B4D" : "#88B5A2" }} />
                    <span className="text-[12px] font-medium">{label}</span>
                    {active && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full" style={{ background: "#1F6B4D" }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fixed value — shown if FIXED selected */}
          {form.incentiveTypes.includes("FIXED") && (
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                Valor fijo (€ por reserva confirmada)
              </label>
              <input
                type="number" min={0.1} step="any" required
                value={form.fixedValue}
                onChange={(e) => setForm({ ...form, fixedValue: e.target.value })}
                placeholder="Ej: 15"
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
          )}

          {/* Percentage value — shown if PERCENTAGE selected */}
          {form.incentiveTypes.includes("PERCENTAGE") && (
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                Porcentaje del ticket (%)
              </label>
              <input
                type="number" min={0.1} step="any" required
                value={form.percentageValue}
                onChange={(e) => setForm({ ...form, percentageValue: e.target.value })}
                placeholder="Ej: 5"
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
          )}

          {/* Bono fields — shown if BONO selected */}
          {form.incentiveTypes.includes("BONO") && (
            <div className="space-y-4 rounded-xl p-4" style={{ background: "rgba(31,107,77,0.04)", border: "1px solid rgba(31,107,77,0.12)" }}>
              <p className="text-[11px] uppercase tracking-[0.1em] font-mono" style={{ color: "#1F6B4D" }}>Configuración del bono</p>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>{t("bonus_description")}</label>
                <input
                  required
                  value={form.bonusDescription}
                  onChange={(e) => setForm({ ...form, bonusDescription: e.target.value })}
                  placeholder="Ej: Cena degustación para 2"
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1" style={{ color: "#0F1F1A" }}>
                  Valor mínimo de canje (€)
                </label>
                <p className="text-[12px] mb-1.5" style={{ color: "#88B5A2" }}>
                  Saldo mínimo que debe tener el captador en su wallet para solicitar este bono
                </p>
                <input
                  type="number" min={0.01} step="any" required
                  value={form.bonusMinValue}
                  onChange={(e) => setForm({ ...form, bonusMinValue: e.target.value })}
                  placeholder="Ej: 30"
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "startDate", label: t("start_date") },
              { key: "endDate",   label: t("end_date") },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" style={{ color: "#88B5A2" }} />{label}</span>
                </label>
                <input
                  type="date"
                  required={key === "startDate"}
                  min={key === "endDate" ? form.startDate : undefined}
                  value={form[key as "startDate" | "endDate"]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
            ))}
          </div>

          {/* Max reservations */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>
              <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" style={{ color: "#88B5A2" }} />{t("max_reservations")}</span>
            </label>
            <input
              type="number" min={1}
              value={form.maxReservations}
              onChange={(e) => setForm({ ...form, maxReservations: e.target.value })}
              placeholder="Sin límite"
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-60 hover:opacity-90"
            style={{ background: "#1F6B4D", color: "#F2EBDC" }}
          >
            {loading ? "Creando..." : t("create")}
          </button>
        </form>
      </div>
    </div>
  )
}
