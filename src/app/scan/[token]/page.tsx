"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, Users, Calendar, Clock3, Shield, Delete } from "lucide-react"
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
  const [pin, setPin] = useState(["", "", "", ""])
  const [pinError, setPinError] = useState(false)
  const [staffName, setStaffName] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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

  const pinValue = pin.join("")

  const handlePinDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...pin]
    next[index] = value
    setPin(next)
    setPinError(false)
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleDelete = () => {
    const lastFilled = [...pin].reverse().findIndex((d) => d !== "")
    if (lastFilled === -1) return
    const idx = 3 - lastFilled
    const next = [...pin]
    next[idx] = ""
    setPin(next)
    setPinError(false)
    inputRefs.current[idx]?.focus()
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
        setState("ready")
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

  // Auto-submit when all 4 digits are filled
  useEffect(() => {
    if (state === "ready" && pinValue.length === 4) {
      handleConfirm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinValue, state])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "#F2EBDC" }}>
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

        {/* Ready / Confirming — show reservation + PIN input */}
        {(state === "ready" || state === "confirming") && reservation && (
          <>
            {/* Business + client info */}
            <div className="text-center mb-5">
              <p
                className="text-[10px] uppercase tracking-[0.12em] font-mono"
                style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}
              >
                Validar reserva
              </p>
              <p className="font-semibold text-[15px] mt-1" style={{ color: "#0F1F1A" }}>{reservation.businessName}</p>
            </div>

            {/* Reservation details */}
            <div
              className="rounded-2xl p-4 mb-6 space-y-3"
              style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.08)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0"
                  style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D" }}
                >
                  {reservation.clientName.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-[15px]" style={{ color: "#0F1F1A" }}>{reservation.clientName}</p>
              </div>

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

            {/* PIN entry */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="font-medium text-[14px]" style={{ color: "#0F1F1A" }}>Introduce tu PIN</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#88B5A2" }}>4 dígitos asignados al registrarte</p>
              </div>

              {/* PIN boxes */}
              <div className="flex items-center justify-center gap-3">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinDigit(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    className="w-14 h-14 rounded-2xl text-center text-[22px] font-bold outline-none transition-all"
                    style={{
                      background: pinError ? "rgba(220,38,38,0.06)" : "#F2EBDC",
                      border: pinError
                        ? "2px solid rgba(220,38,38,0.40)"
                        : digit
                        ? "2px solid #1F6B4D"
                        : "2px solid rgba(15,31,26,0.15)",
                      color: "#0F1F1A",
                    }}
                    disabled={state === "confirming"}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-center text-[13px] font-medium" style={{ color: "#dc2626" }}>
                  PIN incorrecto. Inténtalo de nuevo.
                </p>
              )}

              {/* Numpad for mobile */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["1","2","3","4","5","6","7","8","9"].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleNumpad(d)}
                    disabled={state === "confirming"}
                    className="h-12 rounded-xl text-[18px] font-semibold transition-opacity hover:opacity-70 active:opacity-50 disabled:opacity-30"
                    style={{ background: "#F2EBDC", color: "#0F1F1A", border: "1px solid rgba(15,31,26,0.10)" }}
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={handleDelete}
                  disabled={state === "confirming"}
                  className="h-12 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30"
                  style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.10)" }}
                >
                  <Delete className="h-5 w-5" style={{ color: "#88B5A2" }} />
                </button>
                <button
                  onClick={() => handleNumpad("0")}
                  disabled={state === "confirming"}
                  className="h-12 rounded-xl text-[18px] font-semibold transition-opacity hover:opacity-70 active:opacity-50 disabled:opacity-30"
                  style={{ background: "#F2EBDC", color: "#0F1F1A", border: "1px solid rgba(15,31,26,0.10)" }}
                >
                  0
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={pinValue.length < 4 || state === "confirming"}
                  className="h-12 rounded-xl text-[14px] font-semibold transition-opacity disabled:opacity-30 hover:opacity-90"
                  style={{ background: "#1F6B4D", color: "#F2EBDC" }}
                >
                  {state === "confirming" ? (
                    <span className="flex items-center justify-center">
                      <span
                        className="h-4 w-4 rounded-full border-2 animate-spin"
                        style={{ borderColor: "rgba(242,235,220,0.30)", borderTopColor: "#F2EBDC" }}
                      />
                    </span>
                  ) : "OK"}
                </button>
              </div>
            </div>
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
              <p
                className="text-[22px] font-bold"
                style={{ color: "#0F1F1A", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                ¡Reserva confirmada!
              </p>
              <p className="text-[14px] mt-1" style={{ color: "#88B5A2" }}>{reservation.clientName}</p>
              {staffName && (
                <p className="text-[12px] mt-1" style={{ color: "#88B5A2" }}>Validado por {staffName}</p>
              )}
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
