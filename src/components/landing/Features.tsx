const features = [
  {
    eyebrow: "ATRIBUCIÓN ANTI-FRAUDE",
    title: "Cada conversión, verificada.",
    desc: "Verificación de presencia física mediante QR único por reserva. KYC del captador antes del primer pago. Sistema anti-self-referral que detecta cuando captador y cliente son la misma persona.",
    points: ["QR de un solo uso por reserva", "KYC verificado antes del pago", "Anti-self-referral automático", "Historial inmutable de cada conversión"],
    visual: (
      <div className="rounded-2xl p-6 space-y-3" style={{ background: "#0B2E22" }}>
        {[
          { label: "Identidad captador", status: "KYC verificado", ok: true },
          { label: "QR de reserva #xk9q", status: "Uso único · válido", ok: true },
          { label: "Auto-referral check", status: "Sin conflicto", ok: true },
          { label: "Pago captador", status: "Liberado · €15", ok: true },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-[13px]" style={{ color: "#C7DDD0" }}>{row.label}</span>
            <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#88B5A2" }}>
              <span className="h-4 w-4 rounded-full flex items-center justify-center" style={{ background: "rgba(31,107,77,0.25)" }}>
                <svg width="8" height="8" fill="none" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke="#88B5A2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              {row.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "PARA CAPTADORES",
    title: "Anonimato total. Cobro real.",
    desc: "El cliente final nunca sabe quién hizo la recomendación, ni a qué empresa pertenece el captador. Los pagos van a cuenta personal del captador, nunca a su empleador.",
    points: ["El negocio no sabe dónde trabajas", "Tu identidad protegida", "Cobro a cuenta personal", "Sin vínculos laborales expuestos"],
    visual: (
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "#0B2E22" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-[14px]" style={{ background: "rgba(136,181,162,0.15)", color: "#88B5A2" }}>?</div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: "#C7DDD0" }}>Captador anónimo</p>
            <p className="text-[11px]" style={{ color: "#88B5A2" }}>Identidad protegida · KYC interno</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "#88B5A2" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></svg>
          El restaurante ve: reserva verificada ✓
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "#88B5A2" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3"/></svg>
          El empleador del captador ve: nada
        </div>
        <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: "rgba(216,139,46,0.12)", border: "1px solid rgba(216,139,46,0.2)" }}>
          <span className="text-[12px]" style={{ color: "#EFC78A" }}>Pago a cuenta personal</span>
          <span className="text-[16px] font-semibold" style={{ color: "#D88B2E" }}>€15 →</span>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "PROGRAMA DE NIVELES",
    title: "Cuanto más captas, más ganas.",
    desc: "Sistema de cuatro niveles con multiplicadores crecientes, pagos prioritarios y soporte dedicado. Incentivo para que los mejores captadores sigan eligiendo Incentis.",
    points: ["Bronze → Silver → Gold → Platinum", "Multiplicadores hasta 2×", "Payout prioritario en 24h", "Soporte dedicado en Gold+"],
    visual: (
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0B2E22" }}>
        {[
          { level: "Bronze", req: "0–9 conversiones", multi: "1×", color: "#A8743A" },
          { level: "Silver", req: "10–29 conversiones", multi: "1.25×", color: "#C9C2B0" },
          { level: "Gold",   req: "30–99 conversiones", multi: "1.5×", color: "#D88B2E" },
          { level: "Platinum", req: "100+ conversiones", multi: "2×", color: "#4A6B7A" },
        ].map((tier, i) => (
          <div key={tier.level} className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: i === 2 ? "rgba(216,139,46,0.08)" : undefined }}>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ background: tier.color }} />
              <span className="text-[13px] font-medium" style={{ color: "#C7DDD0" }}>{tier.level}</span>
            </div>
            <span className="text-[11px]" style={{ color: "#88B5A2" }}>{tier.req}</span>
            <span className="text-[13px] font-semibold" style={{ color: tier.color }}>{tier.multi}</span>
          </div>
        ))}
      </div>
    ),
  },
]

export function Features() {
  return (
    <section id="producto" className="py-24 px-6 md:px-12" style={{ background: "#E8DFCD" }}>
      <div className="max-w-[1200px] mx-auto space-y-20">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-center" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          PARA EMPRESAS Y CAPTADORES
        </p>
        {features.map((f, i) => (
          <div
            key={f.eyebrow}
            className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            {/* Text */}
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-4" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
                {f.eyebrow}
              </p>
              <h2
                className="font-display font-semibold mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(26px,3vw,36px)", letterSpacing: "-0.03em" }}
              >
                {f.title}
              </h2>
              <p className="text-[16px] leading-relaxed mb-6" style={{ color: "#2A3B34" }}>
                {f.desc}
              </p>
              <ul className="space-y-2.5">
                {f.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[14px]" style={{ color: "#2A3B34" }}>
                    <span className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(31,107,77,0.15)" }}>
                      <svg width="8" height="8" fill="none" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke="#1F6B4D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            {/* Visual */}
            <div>{f.visual}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
