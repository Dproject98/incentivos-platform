const tiers = [
  {
    name: "Bronze",
    color: "#A8743A",
    bg: "rgba(168,116,58,0.08)",
    border: "rgba(168,116,58,0.20)",
    req: "0–9 conversiones",
    multi: "1×",
    payout: "72 h",
    support: "Email",
    perks: ["QR personal por campaña", "Dashboard captador", "Historial de pagos"],
  },
  {
    name: "Silver",
    color: "#6B7A70",
    bg: "rgba(107,122,112,0.08)",
    border: "rgba(107,122,112,0.20)",
    req: "10–29 conversiones",
    multi: "1.25×",
    payout: "48 h",
    support: "Email prioritario",
    perks: ["Todo Bronze", "Multiplicador 1.25×", "Payout 48 h"],
  },
  {
    name: "Gold",
    color: "#D88B2E",
    bg: "rgba(216,139,46,0.10)",
    border: "rgba(216,139,46,0.25)",
    req: "30–99 conversiones",
    multi: "1.5×",
    payout: "24 h",
    support: "Chat dedicado",
    perks: ["Todo Silver", "Multiplicador 1.5×", "Payout 24 h", "Chat dedicado"],
    featured: true,
  },
  {
    name: "Platinum",
    color: "#4A6B7A",
    bg: "rgba(74,107,122,0.08)",
    border: "rgba(74,107,122,0.20)",
    req: "100+ conversiones",
    multi: "2×",
    payout: "12 h",
    support: "Account manager",
    perks: ["Todo Gold", "Multiplicador 2×", "Payout 12 h", "Account manager", "Acceso anticipado a campañas"],
  },
]

export function TierCards() {
  return (
    <section id="niveles" className="py-24 px-6 md:px-12" style={{ background: "#F2EBDC" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-4 text-center" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          NIVELES DE CAPTADOR
        </p>
        <h2
          className="font-display font-semibold text-center mb-4"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(26px,3.5vw,40px)", letterSpacing: "-0.03em" }}
        >
          Cuanto más captas, más ganas.
        </h2>
        <p className="text-center text-[16px] mb-12 max-w-lg mx-auto" style={{ color: "#2A3B34" }}>
          Cada conversión verificada suma a tu nivel. Los multiplicadores se aplican automáticamente.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl p-6 flex flex-col gap-4 relative"
              style={{
                background: tier.featured ? "#0B2E22" : tier.bg,
                border: `1.5px solid ${tier.border}`,
              }}
            >
              {tier.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ background: "#D88B2E", color: "#0B2E22", fontFamily: "var(--font-mono)" }}
                >
                  MÁS POPULAR
                </span>
              )}

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: tier.color }} />
                <span
                  className="font-display font-semibold text-[18px]"
                  style={{ fontFamily: "var(--font-display)", color: tier.featured ? "#F2EBDC" : "#0F1F1A", letterSpacing: "-0.02em" }}
                >
                  {tier.name}
                </span>
              </div>

              <p className="text-[12px]" style={{ color: tier.featured ? "#88B5A2" : "#2A3B34" }}>{tier.req}</p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Multiplicador", value: tier.multi, amber: true },
                  { label: "Payout", value: tier.payout, amber: false },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-2.5"
                    style={{ background: tier.featured ? "rgba(255,255,255,0.05)" : "rgba(15,31,26,0.05)" }}
                  >
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>{stat.label}</p>
                    <p className="text-[16px] font-semibold" style={{ color: stat.amber ? "#D88B2E" : (tier.featured ? "#C7DDD0" : "#0F1F1A") }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <ul className="space-y-1.5 mt-1">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-[13px]" style={{ color: tier.featured ? "#C7DDD0" : "#2A3B34" }}>
                    <span className="mt-0.5 text-[10px]" style={{ color: tier.color }}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>

              <p className="text-[11px] mt-auto pt-2" style={{ color: "#88B5A2" }}>Soporte: {tier.support}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
