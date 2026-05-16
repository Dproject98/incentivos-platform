const testimonials = [
  {
    quote: "Llevábamos 2 años con publicidad digital sin saber si funcionaba. Con Incentis pagamos €800 en incentivos y facturamos €9.200 en reservas nuevas ese mes.",
    name: "Laura Viñas",
    role: "Directora de Marketing",
    company: "Grupo Gastro BCN",
    city: "Barcelona",
  },
  {
    quote: "Mis compañeros me envían clientes al spa donde trabajo. Yo no tengo que decir nada, simplemente cobro cuando el cliente aparece con mi QR. En 3 meses llevo €340.",
    name: "Marcos T.",
    role: "Captador anónimo",
    company: "Silver · 18 conversiones",
    city: "Madrid",
  },
]

interface SocialProofProps {
  totalPaid: number
  empresasCount: number
  conversionRate: number
}

export function SocialProof({ totalPaid, empresasCount, conversionRate }: SocialProofProps) {
  const formatEur = (n: number) => "€" + Math.round(n).toLocaleString("es-ES")

  const metrics = [
    { value: formatEur(totalPaid), label: "pagados a captadores" },
    { value: String(empresasCount), label: "empresas activas" },
    { value: conversionRate + "%", label: "tasa de conversión verificada" },
  ]

  return (
    <section id="casos" className="py-24 px-6 md:px-12" style={{ background: "#E8DFCD" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-12 text-center" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          RESULTADOS REALES
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-16">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p
                className="font-display font-semibold"
                style={{ fontFamily: "var(--font-display)", color: "#D88B2E", fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-0.04em" }}
              >
                {m.value}
              </p>
              <p className="text-[14px] mt-1" style={{ color: "#2A3B34" }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-7"
              style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.08)" }}
            >
              <p className="text-[16px] leading-relaxed mb-6" style={{ color: "#0F1F1A" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-[14px] shrink-0"
                  style={{ background: "rgba(31,107,77,0.12)", color: "#1F6B4D" }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: "#0F1F1A" }}>{t.name}</p>
                  <p className="text-[12px]" style={{ color: "#88B5A2" }}>{t.role} · {t.company} · {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
