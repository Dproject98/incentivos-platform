import Link from "next/link"

interface HeroProps {
  locale: string
  confirmedThisMonth: number
  captadoresCount: number
  conversionRate: number
  paidThisWeek: number
}

export function Hero({ locale, confirmedThisMonth, captadoresCount, conversionRate, paidThisWeek }: HeroProps) {
  const fmtEur = (n: number) => "+€" + Math.round(n).toLocaleString("es-ES")

  return (
    <section className="pt-32 pb-24 px-6 md:px-12" style={{ background: "#F2EBDC" }}>
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div>
          <p
            className="text-[11px] font-mono uppercase tracking-[0.14em] mb-6"
            style={{ color: "#1F6B4D", fontFamily: "var(--font-mono)" }}
          >
            PLATAFORMA DE CAPTACIÓN VERIFICADA
          </p>
          <h1
            className="font-display font-semibold leading-[1.04] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              color: "#0F1F1A",
              fontSize: "clamp(40px, 5.5vw, 72px)",
              letterSpacing: "-0.035em",
            }}
          >
            Paga solo cuando alguien trae un cliente real.
          </h1>
          <p
            className="text-[18px] leading-relaxed mb-8 max-w-[480px]"
            style={{ color: "#2A3B34", fontFamily: "var(--font-body)" }}
          >
            Incentis convierte cualquier recomendación en una venta medible. Tú defines la recompensa. Nosotros verificamos el resultado.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Link
              href={`/${locale}/register/empresa`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[15px] font-semibold transition-all hover:opacity-90"
              style={{ background: "#1F6B4D", color: "#F2EBDC" }}
            >
              Soy empresa
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link
              href={`/${locale}/register/captador`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[15px] font-semibold transition-all hover:bg-black/5"
              style={{ border: "1.5px solid #0F1F1A", color: "#0F1F1A" }}
            >
              Quiero captar
            </Link>
          </div>
          <p className="text-[13px]" style={{ color: "#88B5A2" }}>
            Sin tarjeta · Activo en 10 minutos · Cumplimiento RGPD
          </p>
        </div>

        {/* Right: dashboard mockup */}
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#0B2E22",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 64px rgba(15,31,26,0.18)",
            }}
          >
            {/* Mockup header */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              <span className="ml-3 text-[11px] font-mono" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
                incentis · dashboard empresa
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Conversiones", value: String(confirmedThisMonth), sub: "este mes" },
                  { label: "Captadores", value: String(captadoresCount), sub: "activos" },
                  { label: "Verificadas", value: conversionRate + "%", sub: "anti-fraude" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>{s.label}</p>
                    <p className="text-[20px] font-display font-semibold" style={{ color: "#F2EBDC", fontFamily: "var(--font-display)" }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: "#88B5A2" }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Amber badge */}
              <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(216,139,46,0.15)", border: "1px solid rgba(216,139,46,0.25)" }}>
                <span className="text-[13px] font-medium" style={{ color: "#EFC78A" }}>Incentivos pagados esta semana</span>
                <span className="text-[18px] font-display font-semibold" style={{ color: "#D88B2E", fontFamily: "var(--font-display)" }}>{fmtEur(paidThisWeek)}</span>
              </div>

              {/* Mini table */}
              <div className="space-y-2">
                {[
                  { name: "Captador #A7", campaign: "Cena para 2", amount: "15€", status: "verificado" },
                  { name: "Captador #B3", campaign: "Sesión spa", amount: "25€", status: "verificado" },
                  { name: "Captador #C1", campaign: "Cena para 2", amount: "15€", status: "pendiente" },
                ].map((row) => (
                  <div key={row.name} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: "#C7DDD0" }}>{row.name}</p>
                      <p className="text-[10px]" style={{ color: "#88B5A2" }}>{row.campaign}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-semibold" style={{ color: "#D88B2E" }}>{row.amount}</span>
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{
                          fontFamily: "var(--font-mono)",
                          background: row.status === "verificado" ? "rgba(31,107,77,0.2)" : "rgba(255,255,255,0.06)",
                          color: row.status === "verificado" ? "#88B5A2" : "#88B5A2",
                          border: row.status === "verificado" ? "1px solid rgba(31,107,77,0.3)" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div
            className="absolute -bottom-4 -left-4 rounded-2xl px-4 py-3 shadow-lg"
            style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.10)" }}
          >
            <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>ROI verificado</p>
            <p className="text-[22px] font-display font-semibold" style={{ color: "#0F1F1A", fontFamily: "var(--font-display)" }}>7.2×</p>
          </div>
        </div>
      </div>
    </section>
  )
}
