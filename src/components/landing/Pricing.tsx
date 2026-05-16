import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "8%",
    priceDesc: "por conversión verificada",
    desc: "Para negocios que quieren probar la captación por resultados sin riesgo.",
    features: [
      "Campañas ilimitadas",
      "Hasta 50 conversiones/mes",
      "Dashboard básico",
      "Email de soporte",
      "Verificación QR incluida",
    ],
    cta: "Empezar gratis",
    href: "/register/empresa",
    featured: false,
  },
  {
    name: "Growth",
    price: "6%",
    priceDesc: "por conversión verificada",
    desc: "Para empresas con volumen que quieren optimizar su coste de adquisición.",
    features: [
      "Todo Starter",
      "Conversiones ilimitadas",
      "Dashboard avanzado + exportación",
      "Chat de soporte prioritario",
      "API access (próximamente)",
      "Integración CRM (próximamente)",
    ],
    cta: "Empezar con Growth",
    href: "/register/empresa",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "A medida",
    priceDesc: "volumen + SLA personalizados",
    desc: "Para grupos y scaleups con necesidades específicas de compliance o integración.",
    features: [
      "Todo Growth",
      "Comisión negociada por volumen",
      "Account manager dedicado",
      "SLA garantizado",
      "Integración personalizada",
      "Onboarding asistido",
    ],
    cta: "Hablamos",
    href: "mailto:hola@incentis.app",
    featured: false,
  },
]

export function Pricing({ locale }: { locale: string }) {
  return (
    <section id="precios" className="py-24 px-6 md:px-12" style={{ background: "#E8DFCD" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-4 text-center" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          PRECIOS
        </p>
        <h2
          className="font-display font-semibold text-center mb-4"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(26px,3.5vw,40px)", letterSpacing: "-0.03em" }}
        >
          Pagas solo por resultado.
        </h2>
        <p className="text-center text-[16px] mb-12 max-w-lg mx-auto" style={{ color: "#2A3B34" }}>
          Sin fee mensual. Sin compromiso. Solo un porcentaje de cada conversión verificada.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col gap-5 relative"
              style={{
                background: plan.featured ? "#0B2E22" : "#F2EBDC",
                border: plan.featured ? "1.5px solid rgba(31,107,77,0.4)" : "1px solid rgba(15,31,26,0.10)",
              }}
            >
              {plan.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: "#1F6B4D", color: "#F2EBDC", fontFamily: "var(--font-mono)" }}
                >
                  RECOMENDADO
                </span>
              )}

              <div>
                <p className="text-[13px] font-semibold mb-3" style={{ color: plan.featured ? "#88B5A2" : "#2A3B34" }}>{plan.name}</p>
                <p
                  className="font-display font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: plan.featured ? "#D88B2E" : "#0F1F1A", fontSize: "clamp(32px,4vw,44px)", letterSpacing: "-0.04em" }}
                >
                  {plan.price}
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: plan.featured ? "#88B5A2" : "#2A3B34" }}>{plan.priceDesc}</p>
              </div>

              <p className="text-[14px] leading-relaxed" style={{ color: plan.featured ? "#C7DDD0" : "#2A3B34" }}>
                {plan.desc}
              </p>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px]" style={{ color: plan.featured ? "#C7DDD0" : "#2A3B34" }}>
                    <span className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0" style={{ background: plan.featured ? "rgba(31,107,77,0.25)" : "rgba(31,107,77,0.12)" }}>
                      <svg width="8" height="8" fill="none" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke="#1F6B4D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href.startsWith("mailto") ? plan.href : `/${locale}${plan.href}`}
                className="block text-center py-3 rounded-full text-[14px] font-semibold transition-all hover:opacity-90"
                style={{
                  background: plan.featured ? "#1F6B4D" : "rgba(15,31,26,0.08)",
                  color: plan.featured ? "#F2EBDC" : "#0F1F1A",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[13px] mt-8" style={{ color: "#88B5A2" }}>
          Sin permanencia · Sin tarjeta para empezar · Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
