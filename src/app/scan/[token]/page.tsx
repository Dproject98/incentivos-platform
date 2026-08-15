"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import {
  CheckCircle, XCircle, Clock, Users, Calendar, Clock3,
  Shield, QrCode, ChevronRight, X,
} from "lucide-react"
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

type PageState =
  | "loading"
  | "ready"
  | "pin_entry"
  | "confirming"
  | "confirmed"
  | "already_scanned"
  | "invalid"

const BG   = "oklch(0.15 0.012 250)"
const CARD = "oklch(0.19 0.015 250)"
const INP  = "oklch(0.22 0.015 250)"
const BDR  = "oklch(0.30 0.02 250)"
const MUT  = "oklch(0.62 0.01 250)"
const ACC  = "#2bd49a"
const INK  = "#0c0c0a"

export default function ScanPage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<PageState>("loading")
  const [reservation, setReservation] = useState<ReservationData | null>(null)
  const [pin, setPin] = useState(["", "", "", ""])
  const [pinError, setPinError] = useState(false)
  const [staffName, setStaffName] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

  useEffect(() => {
    fetch(`/api/scan/${token}`)
      .then((r) => { if (!r.ok) { setState("invalid"); return null } return r.json() })
      .then((data) => {
        if (!data) return
        setReservation(data)
        setState(data.status === "CONFIRMED" ? "already_scanned" : "ready")
      })
      .catch(() => setState("invalid"))
  }, [token])

  useEffect(() => {
    if (state === "pin_entry") {
      setTimeout(() => inputRefs.current[0]?.focus(), 80)
    }
  }, [state])

  const pinValue = pin.join("")

  const handleDigitInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...pin]
    next[index] = value
    setPin(next)
    setPinError(false)
    if (value && index < 3) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleNumpad = (digit: string) => {
    const idx = pin.findIndex((d) => d === "")
    if (idx === -1) return
    const next = [...pin]
    next[idx] = digit
    setPin(next)
    setPinError(false)
    if (idx < 3) inputRefs.current[idx + 1]?.focus()
  }

  const handleBackspace = () => {
    const lastIdx = [...pin].map((d, i) => (d ? i : -1)).filter((i) => i >= 0).pop() ?? -1
    if (lastIdx < 0) return
    const next = [...pin]
    next[lastIdx] = ""
    setPin(next)
    setPinError(false)
  }

  const handleConfirm = async () => {
    if (pinValue.length < 4) return
    setState("confirming")
    setPinError(false)

    const res = await fetch(`/api/scan/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinValue }),
    })

    if (res.status === 409) { setState("already_scanned"); return }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (err.error === "wrong_pin") {
        setPinError(true)
        setPin(["", "", "", ""])
        setState("pin_entry")
        setTimeout(() => inputRefs.current[0]?.focus(), 50)
        return
      }
      setState("invalid")
      return
    }

    const data = await res.json()
    setStaffName(data.staffName ?? null)
    setState("confirmed")
  }

  useEffect(() => {
    if (state === "pin_entry" && pinValue.length === 4) {
      handleConfirm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinValue])

  const DetailGrid = ({ r }: { r: ReservationData }) => (
    <div className="grid grid-cols-3 gap-2">
      {[
        { Icon: Calendar, value: new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) },
        { Icon: Clock3,   value: r.time },
        { Icon: Users,    value: `${r.guests} pax` },
      ].map(({ Icon, value }) => (
        <div
          key={value}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BDR}` }}
        >
          <Icon className="h-4 w-4" style={{ color: MUT }} />
          <span className="text-[12px] font-medium" style={{ color: "#ffffff" }}>{value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: BG }}>
      <div className="mb-8"><IncentisLogo size="md" light /></div>

      <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: CARD, border: `1px solid ${BDR}` }}>

        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div
              className="h-10 w-10 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(43,212,154,0.20)", borderTopColor: ACC }}
            />
            <p className="text-[13px]" style={{ color: MUT }}>Verificando reserva...</p>
          </div>
        )}

        {/* Invalid */}
        {state === "invalid" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}>
              <XCircle className="h-8 w-8" style={{ color: "#dc2626" }} />
            </div>
            <div>
              <p className="font-semibold text-[16px]" style={{ color: "#ffffff" }}>QR no válido</p>
              <p className="text-[13px] mt-1" style={{ color: MUT }}>Este código QR no es válido o ha caducado.</p>
            </div>
          </div>
        )}

        {/* Ready: reservation info + Verify button */}
        {state === "ready" && reservation && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl mb-3"
                style={{ background: "rgba(43,212,154,0.10)", border: "1px solid rgba(43,212,154,0.20)" }}>
                <QrCode className="h-6 w-6" style={{ color: ACC }} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-mono" style={{ color: MUT }}>
                Reserva verificada
              </p>
              <p className="font-semibold text-[16px] mt-1" style={{ color: "#ffffff" }}>{reservation.businessName}</p>
            </div>

            <div className="rounded-2xl p-4 space-y-3" style={{ background: INP, border: `1px solid ${BDR}` }}>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full flex items-center justify-center font-bold text-[16px] shrink-0"
                  style={{ background: "rgba(43,212,154,0.12)", color: ACC }}>
                  {reservation.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[15px]" style={{ color: "#ffffff" }}>{reservation.clientName}</p>
                  <p className="text-[12px]" style={{ color: MUT }}>Cliente</p>
                </div>
              </div>
              <DetailGrid r={reservation} />
            </div>

            <button
              onClick={() => setState("pin_entry")}
              className="w-full py-3.5 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: ACC, color: INK }}
            >
              Verificar reserva
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* PIN entry */}
        {(state === "pin_entry" || state === "confirming") && reservation && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setPin(["", "", "", ""]); setPinError(false); setState("ready") }}
                disabled={state === "confirming"}
                className="h-8 w-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BDR}` }}
              >
                <X className="h-4 w-4" style={{ color: MUT }} />
              </button>
              <div>
                <p className="font-semibold text-[15px]" style={{ color: "#ffffff" }}>{reservation.clientName}</p>
                <p className="text-[12px]" style={{ color: MUT }}>{reservation.businessName}</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="font-medium text-[15px]" style={{ color: "#ffffff" }}>Introduce tu código de empleado</p>
              <p className="text-[13px] mt-1" style={{ color: MUT }}>PIN de 4 dígitos asignado al registrarte</p>
            </div>

            <div className="flex items-center justify-center gap-3">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={state === "confirming"}
                  className="w-14 h-14 rounded-2xl text-center text-[24px] font-bold outline-none transition-all"
                  style={{
                    background: pinError ? "rgba(220,38,38,0.12)" : INP,
                    border: pinError
                      ? "2px solid rgba(220,38,38,0.50)"
                      : digit
                        ? `2px solid ${ACC}`
                        : `2px solid ${BDR}`,
                    color: "#ffffff",
                  }}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-center text-[13px] font-medium" style={{ color: "#dc2626" }}>
                Código incorrecto. Inténtalo de nuevo.
              </p>
            )}

            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button key={d} onClick={() => handleNumpad(d)} disabled={state === "confirming"}
                  className="h-12 rounded-xl text-[18px] font-semibold transition-opacity hover:opacity-70 active:scale-95 disabled:opacity-30"
                  style={{ background: INP, color: "#ffffff", border: `1px solid ${BDR}` }}>
                  {d}
                </button>
              ))}
              <button onClick={handleBackspace} disabled={state === "confirming"}
                className="h-12 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30"
                style={{ background: INP, border: `1px solid ${BDR}` }}>
                <span className="text-[18px]" style={{ color: MUT }}>⌫</span>
              </button>
              <button onClick={() => handleNumpad("0")} disabled={state === "confirming"}
                className="h-12 rounded-xl text-[18px] font-semibold transition-opacity hover:opacity-70 active:scale-95 disabled:opacity-30"
                style={{ background: INP, color: "#ffffff", border: `1px solid ${BDR}` }}>
                0
              </button>
              <button onClick={handleConfirm} disabled={pinValue.length < 4 || state === "confirming"}
                className="h-12 rounded-xl text-[14px] font-semibold transition-opacity disabled:opacity-30 hover:opacity-90"
                style={{ background: ACC, color: INK }}>
                {state === "confirming"
                  ? <span className="flex items-center justify-center">
                      <span className="h-4 w-4 rounded-full border-2 animate-spin inline-block"
                        style={{ borderColor: "rgba(12,12,10,0.30)", borderTopColor: INK }} />
                    </span>
                  : "OK"}
              </button>
            </div>
          </div>
        )}

        {/* Confirmed */}
        {state === "confirmed" && reservation && (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="h-20 w-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(43,212,154,0.10)", border: "1px solid rgba(43,212,154,0.20)" }}>
              <CheckCircle className="h-10 w-10" style={{ color: ACC }} />
            </div>
            <div>
              <p className="text-[22px] font-bold" style={{ color: "#ffffff", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
                ¡Reserva confirmada!
              </p>
              <p className="text-[14px] mt-1" style={{ color: MUT }}>{reservation.clientName}</p>
              {staffName && (
                <p className="text-[12px] mt-1" style={{ color: MUT }}>Validado por <strong style={{ color: "#ffffff" }}>{staffName}</strong></p>
              )}
            </div>
            <div className="w-full rounded-xl p-3 flex items-center gap-2 text-[13px]"
              style={{ background: "rgba(43,212,154,0.08)", border: "1px solid rgba(43,212,154,0.20)", color: ACC }}>
              <Shield className="h-4 w-4 shrink-0" />
              Incentivo acreditado automáticamente al captador.
            </div>
          </div>
        )}

        {/* Already scanned */}
        {state === "already_scanned" && reservation && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.25)" }}>
              <Clock className="h-8 w-8" style={{ color: "#fbbf24" }} />
            </div>
            <div>
              <p className="font-semibold text-[16px]" style={{ color: "#ffffff" }}>Ya validada</p>
              <p className="text-[13px] mt-1" style={{ color: MUT }}>
                Esta reserva ya fue confirmada el{" "}
                {reservation.qrScannedAt
                  ? new Date(reservation.qrScannedAt).toLocaleString("es-ES")
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px]" style={{ color: MUT }}>Plataforma de incentivos anónimos · Incentis</p>
    </div>
  )
}
