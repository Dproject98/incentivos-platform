export function TrustBar() {
  const logos = ["Grupo Barceló", "Mango", "Clínicas Eugin", "Pepe Jeans", "Woffu", "Raíces Capital"]

  return (
    <section className="py-12 px-6 md:px-12 border-y" style={{ background: "#E8DFCD", borderColor: "rgba(15,31,26,0.10)" }}>
      <div className="max-w-[1200px] mx-auto">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.14em] mb-8" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          CONFÍAN EN INCENTIS
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-8">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-[15px] font-display font-semibold"
              style={{ color: "#0F1F1A", opacity: 0.35, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              {logo}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {["Verificado Stripe", "RGPD compliant", "ISO 27001 en curso"].map((badge) => (
            <span
              key={badge}
              className="text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full"
              style={{
                fontFamily: "var(--font-mono)",
                color: "#2A3B34",
                background: "rgba(15,31,26,0.06)",
                border: "1px solid rgba(15,31,26,0.10)",
              }}
            >
              ✓ {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
