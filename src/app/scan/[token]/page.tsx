"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, Users, Calendar, Clock3, Shield } from "lucide-react"
import { IncentisLogo } from "@/components/IncentisLogo"

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
      style={{ background: "#F2EBDC" }}
    >
      {/* Logo */}
      <div className="mb-8">
        <IncentisLogo size="md" />
      </div>

      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.10)" }}
      >
        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div
              className="h-10 w-10 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(31,107,77,0.20)", borderTopColor: "#1F6B4D" }}
            />
            <p className="text-[13px]" style={{ color: "#88B5A2" }}>Verificando reserva...</p>
          </div>
        )}

        {/* Invalid */}
        {state === "invalid" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)" }}
            >
              <XCircle className="h-8 w-8" style={{ color: "#dc2626" }} />
            </div>
            <div>
              <p className="font-semibold text-[16px]" style={{ color: "#0F1F1A" }}>QR no válido</p>
              <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>Este código QR no es válido o ha caducado.</p>
            </div>
          </div>
        )}

        {/* Ready / Confirming */}
        {(state === "ready" || state === "confirming") && reservation && (
          <>
            <div className="text-center mb-5">
              <p className="text-[10px] uppercase tracking-[0.12em] font-mono" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
                Validar reserva
              </p>
              <p className="font-semibold text-[15px] mt-1" style={{ color: "#0F1F1A" }}>{reservation.businessName}</p>
            </div>

            <div
              className="rounded-2xl p-4 mb-5 space-y-4"
              style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.08)" }}
            >
              {/* Client avatar */}
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0"
                  style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D" }}
                >
                  {reservation.clientName.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-[15px]" style={{ color: "#0F1F1A" }}>{reservation.clientName}</p>
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
                    style={{ background: "rgba(15,31,26,0.04)" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "#88B5A2" }} />
                    <span className="text-[12px] font-medium" style={{ color: "#0F1F1A" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={state === "confirming"}
              className="w-full py-3 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-60 hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "#1F6B4D", color: "#F2EBDC" }}
            >
              {state === "confirming" ? (
                <>
                  <div
                    className="h-4 w-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: "rgba(242,235,220,0.30)", borderTopColor: "#F2EBDC" }}
                  />
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
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(31,107,77,0.10)", border: "1px solid rgba(31,107,77,0.20)" }}
            >
              <CheckCircle className="h-10 w-10" style={{ color: "#1F6B4D" }} />
            </div>
            <div>
              <p className="text-[20px] font-bold" style={{ color: "#0F1F1A", fontFamily: "var(--font-display)" }}>
                ¡Reserva confirmada!
              </p>
              <p className="text-[14px] mt-1" style={{ color: "#88B5A2" }}>{reservation.clientName}</p>
            </div>
            <div
              className="w-full rounded-xl p-3 flex items-center gap-2 text-[13px]"
              style={{ background: "rgba(31,107,77,0.08)", border: "1px solid rgba(31,107,77,0.15)", color: "#1F6B4D" }}
            >
              <Shield className="h-4 w-4 shrink-0" />
              El incentivo ha sido acreditado automáticamente al captador.
            </div>
          </div>
        )}

        {/* Already scanned */}
        {state === "already_scanned" && reservation && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(216,139,46,0.10)", border: "1px solid rgba(216,139,46,0.25)" }}
            >
              <Clock className="h-8 w-8" style={{ color: "#B5710D" }} />
            </div>
            <div>
              <p className="font-semibold text-[16px]" style={{ color: "#0F1F1A" }}>Ya validada</p>
              <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>
                Esta reserva ya fue confirmada el{" "}
                {reservation.qrScannedAt
                  ? new Date(reservation.qrScannedAt).toLocaleString("es-ES")
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px]" style={{ color: "#88B5A2" }}>Plataforma de incentivos anónimos · Incentis</p>
    </div>
  )
}
