"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, Users, Calendar, Clock3, QrCode, Shield } from "lucide-react"

interface ReservationData {
  id: string
  clientName: string
  date: string
  time: string
  guests: number
  status: string
  qrScannedAt: string | null
  businessName: string
}

type PageState = "loading" | "ready" | "confirming" | "confirmed" | "already_scanned" | "invalid"

export default function ScanPage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<PageState>("loading")
  const [reservation, setReservation] = useState<ReservationData | null>(null)

  useEffect(() => {
    fetch(`/api/scan/${token}`)
      .then((r) => {
        if (!r.ok) { setState("invalid"); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setReservation(data)
        setState(data.status === "CONFIRMED" ? "already_scanned" : "ready")
      })
      .catch(() => setState("invalid"))
  }, [token])

  const handleConfirm = async () => {
    setState("confirming")
    const res = await fetch(`/api/scan/${token}`, { method: "POST" })
    if (res.status === 409) { setState("already_scanned"); return }
    setState(res.ok ? "confirmed" : "invalid")
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0a0e27 0%, #0f1640 50%, #0a0e27 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <QrCode className="h-5 w-5 text-purple-400" />
        </div>
        <span className="font-bold text-lg text-white">Incentis</span>
      </div>

      <div
        className="w-full max-w-sm rounded-3xl border border-white/10 p-6"
        style={{ background: "rgba(26, 31, 58, 0.85)", backdropFilter: "blur(20px)" }}
      >
        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-10 w-10 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
            <p className="text-slate-400 text-sm">Verificando reserva...</p>
          </div>
        )}

        {/* Invalid */}
        {state === "invalid" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-white">QR no válido</p>
              <p className="text-sm text-slate-500 mt-1">Este código QR no es válido o ha caducado.</p>
            </div>
          </div>
        )}

        {/* Ready / Confirming */}
        {(state === "ready" || state === "confirming") && reservation && (
          <>
            <div className="text-center mb-5">
              <p className="text-sm text-slate-500 uppercase tracking-widest">Validar reserva</p>
              <p className="text-white font-semibold mt-1">{reservation.businessName}</p>
            </div>

            <div
              className="rounded-2xl p-4 mb-5 space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Client avatar */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold flex-shrink-0">
                  {reservation.clientName.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-white">{reservation.clientName}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Calendar, value: new Date(reservation.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) },
                  { icon: Clock3,   value: reservation.time },
                  { icon: Users,    value: `${reservation.guests} pax` },
                ].map(({ icon: Icon, value }) => (
                  <div
                    key={value}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={state === "confirming"}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-60 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              {state === "confirming" ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Confirmar llegada
                </>
              )}
            </button>
          </>
        )}

        {/* Confirmed */}
        {state === "confirmed" && reservation && (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="h-20 w-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">¡Reserva confirmada!</p>
              <p className="text-slate-400 text-sm mt-1">{reservation.clientName}</p>
            </div>
            <div
              className="w-full rounded-xl p-3 flex items-center gap-2 text-sm text-green-300"
              style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.15)" }}
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              El incentivo ha sido acreditado automáticamente al captador.
            </div>
          </div>
        )}

        {/* Already scanned */}
        {state === "already_scanned" && reservation && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-16 w-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Ya validada</p>
              <p className="text-sm text-slate-500 mt-1">
                Esta reserva ya fue confirmada el{" "}
                {reservation.qrScannedAt
                  ? new Date(reservation.qrScannedAt).toLocaleString("es-ES")
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-600">Plataforma de incentivos anónimos · Incentis</p>
    </div>
  )
}
