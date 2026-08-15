"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Copy, Check, Send, Clock, CheckCircle, AlertCircle, Euro } from "lucide-react"

const CARD = "oklch(0.19 0.015 250)"
const BDR  = "oklch(0.30 0.02 250)"
const MUT  = "oklch(0.62 0.01 250)"
const ACC  = "#2bd49a"
const INK  = "#0c0c0a"

// ── Replace with your actual IBAN and bank details ─────────────────────────
const PLATFORM_IBAN   = "ES12 3456 7890 1234 5678 9012"
const PLATFORM_HOLDER = "NOMBRE EMPRESA, S.L."
const PLATFORM_BIC    = "CAIXESBBXXX"
// ──────────────────────────────────────────────────────────────────────────

interface PendingReservation {
  id: string
  clientName: string
  date: string
  campaignTitle: string
  incentiveAmount: number
  chosenIncentiveType: string
}

interface PendingPayment {
  id: string
  amount: number
  reference: string
  createdAt: string
  reservationCount: number
}

export default function FacturacionPage() {
  const params = useParams()
  const locale = params.locale as string

  const [pending, setPending]           = useState<PendingReservation[]>([])
  const [payments, setPayments]         = useState<PendingPayment[]>([])
  const [total, setTotal]               = useState(0)
  const [reference, setReference]       = useState("")
  const [submitting, setSubmitting]     = useState(false)
  const [submitted, setSubmitted]       = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [copied, setCopied]             = useState<string | null>(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    fetch("/api/empresa/facturacion")
      .then((r) => r.json())
      .then((d) => {
        setPending(d.pending ?? [])
        setPayments(d.payments ?? [])
        setTotal(d.total ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleNotify = async () => {
    if (!reference.trim()) { setError("Introduce la referencia de la transferencia."); return }
    setSubmitting(true)
    setError(null)
    const res = await fetch("/api/empresa/facturacion/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: reference.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error === "no_pending" ? "No hay comisiones pendientes de pago." : "Error al enviar la notificación.")
      setSubmitting(false)
      return
    }
    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(43,212,154,0.2)", borderTopColor: ACC }} />
    </div>
  )

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(22px,3vw,30px)", color: "#fff", letterSpacing: "-0.03em" }}>
          Facturación
        </h1>
        <p className="text-[14px] mt-1" style={{ color: MUT }}>
          Gestiona el pago de comisiones a los captadores.
        </p>
      </div>

      {/* Resumen pendiente */}
      <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BDR}` }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] font-mono" style={{ color: MUT }}>Pendiente de pago</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, color: total > 0 ? "#fbbf24" : ACC, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {total.toFixed(2)} €
            </p>
          </div>
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: total > 0 ? "rgba(251,191,36,0.10)" : "rgba(43,212,154,0.10)", border: `1px solid ${total > 0 ? "rgba(251,191,36,0.25)" : "rgba(43,212,154,0.20)"}` }}>
            <Euro className="h-6 w-6" style={{ color: total > 0 ? "#fbbf24" : ACC }} />
          </div>
        </div>

        {pending.length > 0 ? (
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid oklch(0.26 0.018 250)` }}>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "#fff" }}>{r.clientName}</p>
                  <p className="text-[11px]" style={{ color: MUT }}>{r.campaignTitle} · {new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</p>
                </div>
                <span className="text-[13px] font-semibold" style={{ color: ACC }}>
                  {r.chosenIncentiveType === "FIXED" ? `${r.incentiveAmount.toFixed(2)} €` : `${r.incentiveAmount}%`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px]" style={{ color: MUT }}>No hay comisiones pendientes de pago. ¡Todo al día! 🎉</p>
        )}
      </div>

      {/* Instrucciones de pago */}
      {total > 0 && !submitted && (
        <div className="rounded-2xl p-6 space-y-5" style={{ background: CARD, border: `1px solid ${BDR}` }}>
          <div>
            <p className="font-semibold text-[15px]" style={{ color: "#fff" }}>Cómo realizar el pago</p>
            <p className="text-[13px] mt-1" style={{ color: MUT }}>Realiza una transferencia bancaria a la siguiente cuenta e indica la referencia de tu empresa.</p>
          </div>

          {/* Bank details */}
          <div className="space-y-3">
            {[
              { label: "Titular", value: PLATFORM_HOLDER },
              { label: "IBAN",    value: PLATFORM_IBAN, key: "iban" },
              { label: "BIC/SWIFT", value: PLATFORM_BIC },
              { label: "Importe", value: `${total.toFixed(2)} €`, key: "amount" },
            ].map(({ label, value, key }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid oklch(0.26 0.018 250)` }}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: MUT }}>{label}</p>
                  <p className="text-[14px] font-medium mt-0.5" style={{ color: "#fff", fontFamily: key ? "var(--font-mono)" : undefined }}>{value}</p>
                </div>
                {key && (
                  <button
                    onClick={() => copy(value, key)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BDR}` }}
                  >
                    {copied === key ? <Check className="h-3.5 w-3.5" style={{ color: ACC }} /> : <Copy className="h-3.5 w-3.5" style={{ color: MUT }} />}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Notification form */}
          <div className="pt-2 border-t" style={{ borderColor: BDR }}>
            <p className="text-[13px] font-medium mb-3" style={{ color: "#fff" }}>Una vez realizada la transferencia, indícanos la referencia:</p>
            <div className="flex gap-2">
              <input
                value={reference}
                onChange={(e) => { setReference(e.target.value); setError(null) }}
                placeholder="Ej: REF-2026-001 o nº de operación del banco"
                className="flex-1 rounded-xl px-4 py-2.5 text-[14px] outline-none"
                style={{ background: "oklch(0.22 0.015 250)", border: `1px solid ${error ? "rgba(220,38,38,0.50)" : BDR}`, color: "#fff" }}
              />
              <button
                onClick={handleNotify}
                disabled={submitting || !reference.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-opacity disabled:opacity-40 hover:opacity-90"
                style={{ background: ACC, color: INK, whiteSpace: "nowrap" }}
              >
                <Send className="h-4 w-4" />
                {submitting ? "Enviando…" : "Notificar"}
              </button>
            </div>
            {error && <p className="text-[12px] mt-2" style={{ color: "#dc2626" }}>{error}</p>}
            <p className="text-[11px] mt-2" style={{ color: MUT }}>
              Te notificaremos por email cuando el equipo de Incentis confirme la recepción del pago (normalmente en 24h laborables).
            </p>
          </div>
        </div>
      )}

      {/* Submitted confirmation */}
      {submitted && (
        <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: "rgba(43,212,154,0.06)", border: "1px solid rgba(43,212,154,0.20)" }}>
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: ACC }} />
          <div>
            <p className="font-semibold text-[14px]" style={{ color: ACC }}>Pago notificado correctamente</p>
            <p className="text-[13px] mt-1" style={{ color: MUT }}>
              Hemos recibido tu notificación. El equipo de Incentis confirmará el pago en un plazo de 24 horas laborables y tus comisiones quedarán marcadas como liquidadas.
            </p>
          </div>
        </div>
      )}

      {/* Historial de pagos */}
      {payments.length > 0 && (
        <div>
          <h2 className="font-semibold text-[16px] mb-4" style={{ color: "#fff" }}>Historial de pagos</h2>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: CARD, border: `1px solid ${BDR}` }}>
                <div className="flex items-center gap-3">
                  {p.reference.startsWith("__pending") ? (
                    <Clock className="h-4 w-4 shrink-0" style={{ color: "#fbbf24" }} />
                  ) : (
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: ACC }} />
                  )}
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#fff" }}>Ref: {p.reference}</p>
                    <p className="text-[11px]" style={{ color: MUT }}>
                      {new Date(p.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })} · {p.reservationCount} reservas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold" style={{ color: ACC }}>{p.amount.toFixed(2)} €</p>
                  <span className="text-[10px] font-mono" style={{ color: p.reference.startsWith("__pending") ? "#fbbf24" : MUT }}>
                    {p.reference.startsWith("__pending") ? "PENDIENTE" : "CONFIRMADO"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
