"use client"

import { useState } from "react"

export function RoiCalculator() {
  const [ticket, setTicket] = useState(80)
  const [margin, setMargin] = useState(30)
  const [clients, setClients] = useState(20)
  const incentiveRate = 0.10

  const totalIncentivos = clients * ticket * incentiveRate
  const grossRevenue = clients * ticket * (margin / 100)
  const netGain = grossRevenue - totalIncentivos
  const roi = totalIncentivos > 0 ? (netGain / totalIncentivos).toFixed(1) : "—"

  const sliders = [
    { label: "Ticket medio", value: ticket, min: 20, max: 500, step: 5, unit: "€", set: setTicket },
    { label: "Margen neto", value: margin, min: 5, max: 70, step: 1, unit: "%", set: setMargin },
    { label: "Clientes/mes objetivo", value: clients, min: 1, max: 200, step: 1, unit: "", set: setClients },
  ]

  return (
    <section id="roi" className="py-24 px-6 md:px-12" style={{ background: "#F2EBDC" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-4 text-center" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          CALCULADORA DE ROI
        </p>
        <h2
          className="font-display font-semibold text-center mb-4"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(26px,3.5vw,40px)", letterSpacing: "-0.03em" }}
        >
          ¿Cuánto te cuesta un cliente real?
        </h2>
        <p className="text-center text-[16px] mb-12 max-w-lg mx-auto" style={{ color: "#2A3B34" }}>
          Solo pagas cuando la conversión ocurre. Ajusta los valores y ve tu ROI en tiempo real.
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Sliders */}
          <div className="rounded-2xl p-8 space-y-6" style={{ background: "#E8DFCD", border: "1px solid rgba(15,31,26,0.08)" }}>
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-2">
                  <label className="text-[14px] font-medium" style={{ color: "#0F1F1A" }}>{s.label}</label>
                  <span className="text-[14px] font-semibold" style={{ color: "#1F6B4D" }}>
                    {s.unit === "€" ? `€${s.value}` : s.unit === "%" ? `${s.value}%` : s.value}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1F6B4D ${((s.value - s.min) / (s.max - s.min)) * 100}%, rgba(15,31,26,0.15) 0%)`,
                    accentColor: "#1F6B4D",
                  }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[11px]" style={{ color: "#88B5A2" }}>{s.unit === "€" ? `€${s.min}` : s.unit === "%" ? `${s.min}%` : s.min}</span>
                  <span className="text-[11px]" style={{ color: "#88B5A2" }}>{s.unit === "€" ? `€${s.max}` : s.unit === "%" ? `${s.max}%` : s.max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="rounded-2xl p-8" style={{ background: "#0B2E22" }}>
              <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
                PAGARÍAS EN INCENTIVOS
              </p>
              <p className="font-display font-semibold" style={{ fontFamily: "var(--font-display)", color: "#D88B2E", fontSize: "clamp(36px,5vw,56px)", letterSpacing: "-0.04em" }}>
                €{totalIncentivos.toFixed(0)}<span className="text-[20px]">/mes</span>
              </p>
              <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>
                {clients} clientes × €{ticket} ticket × 10% incentivo
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: "#E8DFCD", border: "1px solid rgba(15,31,26,0.08)" }}>
                <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>MARGEN NETO</p>
                <p className="font-display font-semibold text-[28px]" style={{ fontFamily: "var(--font-display)", color: netGain >= 0 ? "#1F6B4D" : "#8C2E2E", letterSpacing: "-0.03em" }}>
                  €{netGain.toFixed(0)}
                </p>
              </div>
              <div className="rounded-2xl p-5" style={{ background: "#E8DFCD", border: "1px solid rgba(15,31,26,0.08)" }}>
                <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>ROI</p>
                <p className="font-display font-semibold text-[28px]" style={{ fontFamily: "var(--font-display)", color: "#D88B2E", letterSpacing: "-0.03em" }}>
                  {roi}×
                </p>
              </div>
            </div>

            <p className="text-[12px] text-center" style={{ color: "#88B5A2" }}>
              * Estimación orientativa basada en incentivo del 10% por conversión verificada.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
