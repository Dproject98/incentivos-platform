const steps = [
  {
    num: "01",
    title: "La empresa publica campaña e incentivo.",
    desc: "Define el incentivo (fijo, porcentaje o bono), la fecha y el límite de conversiones. Activo en minutos.",
    visual: (
      <div className="rounded-xl p-4 space-y-2" style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.10)" }}>
        <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>Nueva campaña</p>
        <p className="text-[13px] font-semibold" style={{ color: "#0F1F1A" }}>Trae amigos a cenar · €15 por reserva confirmada</p>
        <div className="flex gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(31,107,77,0.12)", color: "#1F6B4D", border: "1px solid rgba(31,107,77,0.2)" }}>ACTIVA</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(15,31,26,0.06)", color: "#2A3B34" }}>Sin fecha fin</span>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "Los captadores comparten su QR único.",
    desc: "Cada captador tiene un QR personal por campaña. Lo comparte con quién quiera — de forma anónima.",
    visual: (
      <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.10)" }}>
        <div className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#0B2E22" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="2" stroke="#88B5A2" strokeWidth="1.5"/>
            <rect x="16" y="2" width="10" height="10" rx="2" stroke="#88B5A2" strokeWidth="1.5"/>
            <rect x="2" y="16" width="10" height="10" rx="2" stroke="#88B5A2" strokeWidth="1.5"/>
            <rect x="4" y="4" width="6" height="6" rx="1" fill="#D88B2E"/>
            <rect x="18" y="4" width="6" height="6" rx="1" fill="#D88B2E"/>
            <rect x="4" y="18" width="6" height="6" rx="1" fill="#D88B2E"/>
            <rect x="17" y="17" width="3" height="3" fill="#88B5A2"/>
            <rect x="22" y="17" width="3" height="3" fill="#88B5A2"/>
            <rect x="17" y="22" width="3" height="3" fill="#88B5A2"/>
            <rect x="22" y="22" width="3" height="3" fill="#88B5A2"/>
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-medium" style={{ color: "#0F1F1A" }}>QR personal · Captador #A7</p>
          <p className="text-[11px] mt-0.5" style={{ color: "#88B5A2" }}>incentis.vercel.app/scan/xk9q...</p>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Cuando el cliente convierte, el captador cobra en 48 h.",
    desc: "El staff escanea el QR al llegar el cliente. La plataforma verifica, acredita el incentivo y notifica al captador.",
    visual: (
      <div className="rounded-xl p-4 space-y-2" style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.10)" }}>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: "rgba(31,107,77,0.15)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2.5 7l3 3 6-6" stroke="#1F6B4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-[12px] font-medium" style={{ color: "#1F6B4D" }}>Reserva verificada · 20:00</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[12px]" style={{ color: "#2A3B34" }}>Incentivo acreditado</span>
          <span className="text-[18px] font-display font-semibold" style={{ color: "#D88B2E", fontFamily: "var(--font-display)" }}>+€15</span>
        </div>
      </div>
    ),
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-6 md:px-12" style={{ background: "#F2EBDC" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-4 text-center" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          CÓMO FUNCIONA
        </p>
        <h2
          className="font-display font-semibold text-center mb-16"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(28px,3.5vw,40px)", letterSpacing: "-0.03em" }}
        >
          Tres pasos. Sin fricciones.
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "#E8DFCD", border: "1px solid rgba(15,31,26,0.08)" }}
            >
              <span
                className="font-mono font-semibold text-[40px] leading-none"
                style={{ color: "#D88B2E", fontFamily: "var(--font-mono)" }}
              >
                {step.num}
              </span>
              <h3
                className="font-display font-semibold text-[18px] leading-snug"
                style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", letterSpacing: "-0.02em" }}
              >
                {step.title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "#2A3B34" }}>
                {step.desc}
              </p>
              {step.visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
