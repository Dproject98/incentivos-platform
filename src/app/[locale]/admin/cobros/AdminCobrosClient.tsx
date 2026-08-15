"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

const CARD = "oklch(0.19 0.015 250)"
const BDR  = "oklch(0.30 0.02 250)"
const MUT  = "oklch(0.62 0.01 250)"
const ACC  = "#2bd49a"
const INK  = "#0c0c0a"

interface Payment {
  id: string
  amount: number
  reference: string | null
  createdAt: string
  business: { name: string; type: string }
  reservations: Array<{
    id: string
    clientName: string
    date: string
    chosenIncentiveType: string | null
    campaign: { title: string; fixedValue: number | null; percentageValue: number | null; incentiveValue: number }
  }>
}

interface ConfirmedPayment {
  id: string
  amount: number
  reference: string | null
  confirmedAt: string
  business: { name: string }
}

export function AdminCobrosClient({
  locale,
  payments,
  confirmed,
}: {
  locale: string
  payments: Payment[]
  confirmed: ConfirmedPayment[]
}) {
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [done, setDone]             = useState<Set<string>>(new Set())

  const handle = async (paymentId: string, action: "confirm" | "reject") => {
    setProcessing(paymentId)
    const res = await fetch(`/api/admin/cobros/${paymentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      setDone((prev) => new Set(prev).add(paymentId))
    }
    setProcessing(null)
  }

  const pending = payments.filter((p) => !done.has(p.id))

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(22px,3vw,30px)", color: "#fff", letterSpacing: "-0.03em" }}>
          Cobros
        </h1>
        <p className="text-[14px] mt-1" style={{ color: MUT }}>
          Pagos notificados por empresas pendientes de confirmación.
        </p>
      </div>

      {/* Pendientes */}
      {pending.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BDR}` }}>
          <CheckCircle className="h-8 w-8 mx-auto mb-3" style={{ color: ACC }} />
          <p className="text-[15px] font-medium" style={{ color: "#fff" }}>Todo al día</p>
          <p className="text-[13px] mt-1" style={{ color: MUT }}>No hay pagos pendientes de confirmar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.08em] font-mono" style={{ color: MUT }}>
            Pendientes de confirmar ({pending.length})
          </h2>
          {pending.map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BDR}` }}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0"
                    style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
                    {p.business.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px]" style={{ color: "#fff" }}>{p.business.name}</p>
                    <p className="text-[11px] font-mono" style={{ color: MUT }}>
                      Ref: {p.reference ?? "—"} · {p.reservations.length} reservas · {new Date(p.createdAt).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[18px] font-bold" style={{ color: "#fbbf24" }}>{p.amount.toFixed(2)} €</span>
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BDR}` }}
                  >
                    {expanded === p.id
                      ? <ChevronUp className="h-4 w-4" style={{ color: MUT }} />
                      : <ChevronDown className="h-4 w-4" style={{ color: MUT }} />}
                  </button>
                </div>
              </div>

              {/* Expanded reservations */}
              {expanded === p.id && (
                <div className="border-t px-4 py-3 space-y-2" style={{ borderColor: BDR }}>
                  {p.reservations.map((r) => {
                    const amt = r.chosenIncentiveType === "FIXED"
                      ? (r.campaign.fixedValue ?? r.campaign.incentiveValue)
                      : (r.campaign.percentageValue ?? r.campaign.incentiveValue)
                    return (
                      <div key={r.id} className="flex items-center justify-between py-1.5 text-[13px]">
                        <span style={{ color: "oklch(0.78 0.01 250)" }}>{r.clientName}</span>
                        <div className="flex items-center gap-4">
                          <span style={{ color: MUT }}>{r.campaign.title}</span>
                          <span style={{ color: MUT }}>{new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</span>
                          <span className="font-semibold" style={{ color: ACC }}>
                            {r.chosenIncentiveType === "FIXED" ? `${amt} €` : `${amt}%`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 p-4 border-t" style={{ borderColor: BDR }}>
                <button
                  onClick={() => handle(p.id, "confirm")}
                  disabled={processing === p.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[14px] font-semibold transition-opacity disabled:opacity-40 hover:opacity-90"
                  style={{ background: ACC, color: INK }}
                >
                  <CheckCircle className="h-4 w-4" />
                  {processing === p.id ? "Procesando…" : "Confirmar pago recibido"}
                </button>
                <button
                  onClick={() => handle(p.id, "reject")}
                  disabled={processing === p.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-opacity disabled:opacity-40 hover:opacity-70"
                  style={{ background: "rgba(220,38,38,0.10)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.20)" }}
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historial confirmados */}
      {confirmed.length > 0 && (
        <div>
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.08em] font-mono mb-3" style={{ color: MUT }}>
            Últimos confirmados
          </h2>
          <div className="space-y-2">
            {confirmed.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: CARD, border: `1px solid ${BDR}` }}>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 shrink-0" style={{ color: ACC }} />
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#fff" }}>{p.business.name}</p>
                    <p className="text-[11px] font-mono" style={{ color: MUT }}>
                      Ref: {p.reference ?? "—"} · Confirmado {new Date(p.confirmedAt).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
                <span className="text-[14px] font-semibold" style={{ color: ACC }}>{p.amount.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
