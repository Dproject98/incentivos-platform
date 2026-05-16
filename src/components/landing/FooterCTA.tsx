import Link from "next/link"
import { IncentisLogo } from "@/components/IncentisLogo"

export function FooterCTA({ locale }: { locale: string }) {
  return (
    <>
      {/* CTA final */}
      <section className="py-24 px-6 md:px-12" style={{ background: "#0B2E22" }}>
        <div className="max-w-[720px] mx-auto text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-6" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
            EMPIEZA HOY
          </p>
          <h2
            className="font-display font-semibold mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#F2EBDC", fontSize: "clamp(32px,5vw,56px)", letterSpacing: "-0.035em", lineHeight: 1.05 }}
          >
            Paga solo cuando alguien trae un cliente real.
          </h2>
          <p className="text-[18px] mb-10 max-w-md mx-auto" style={{ color: "#88B5A2" }}>
            Sin tarjeta. Sin fee mensual. Sin riesgo. Activo en 10 minutos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/${locale}/register/empresa`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold transition-all hover:opacity-90"
              style={{ background: "#1F6B4D", color: "#F2EBDC" }}
            >
              Soy empresa
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link
              href={`/${locale}/register/captador`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold transition-all hover:bg-white/10"
              style={{ border: "1.5px solid rgba(242,235,220,0.3)", color: "#F2EBDC" }}
            >
              Quiero captar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12 border-t" style={{ background: "#0B2E22", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <IncentisLogo size="sm" light />
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#88B5A2" }}>
                Captación de clientes verificada. Solo pagas por resultado.
              </p>
              <p className="text-[12px] mt-4" style={{ color: "#4A6B7A" }}>
                Barcelona, España
              </p>
            </div>

            {/* Producto */}
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest mb-4" style={{ color: "#4A6B7A", fontFamily: "var(--font-mono)" }}>Producto</p>
              <ul className="space-y-2.5">
                {["Cómo funciona", "Niveles captador", "Precios", "API (próxima)"].map((l) => (
                  <li key={l}><a href="#" className="text-[13px] transition-colors hover:text-paper" style={{ color: "#88B5A2" }}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest mb-4" style={{ color: "#4A6B7A", fontFamily: "var(--font-mono)" }}>Empresa</p>
              <ul className="space-y-2.5">
                {["Sobre nosotros", "Blog", "Casos de éxito", "Contacto"].map((l) => (
                  <li key={l}><a href="#" className="text-[13px] transition-colors hover:text-paper" style={{ color: "#88B5A2" }}>{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest mb-4" style={{ color: "#4A6B7A", fontFamily: "var(--font-mono)" }}>Legal</p>
              <ul className="space-y-2.5">
                {["Términos de uso", "Privacidad", "Cookies", "RGPD"].map((l) => (
                  <li key={l}><a href="#" className="text-[13px] transition-colors" style={{ color: "#88B5A2" }}>{l}</a></li>
                ))}
              </ul>
              <p className="text-[12px] mt-4" style={{ color: "#4A6B7A" }}>
                soporte@incentis.app
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[12px]" style={{ color: "#4A6B7A" }}>
              © {new Date().getFullYear()} Incentis · Todos los derechos reservados
            </p>
            <div className="flex items-center gap-4">
              {["Verificado Stripe", "RGPD"].map((b) => (
                <span key={b} className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#4A6B7A", fontFamily: "var(--font-mono)" }}>
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
