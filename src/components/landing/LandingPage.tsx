"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { IncentisLogo } from "@/components/IncentisLogo"

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "oklch(0.15 0.012 250)",
  s1: "oklch(0.19 0.015 250)",
  s2: "oklch(0.22 0.015 250)",
  border: "oklch(0.30 0.02 250)",
  borderStrong: "oklch(0.40 0.06 250)",
  text: "#ffffff",
  muted: "oklch(0.72 0.01 250)",
  faint: "oklch(0.60 0.01 250)",
  accent: "oklch(0.80 0.17 162)",
  accentDeep: "oklch(0.68 0.15 165)",
  accentDeeper: "oklch(0.62 0.14 165)",
  accentOnLight: "oklch(0.50 0.13 162)",
  lightBg: "oklch(0.96 0.008 250)",
  ink: "#0c0c0a",
  grad: "linear-gradient(135deg, oklch(0.80 0.17 162), oklch(0.68 0.15 165))",
}
const F = {
  brand: "var(--font-brand), 'Bricolage Grotesque', sans-serif",
  sans: "'Instrument Sans', var(--font-body), sans-serif",
  mono: "var(--font-mono), 'JetBrains Mono', monospace",
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const vh = window.innerHeight || 800
    const els = Array.from(root.querySelectorAll("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > vh * 0.85
    ) as HTMLElement[]
    els.forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(28px)"
      el.style.transition = "opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)"
    })
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).style.opacity = "1"
            ;(e.target as HTMLElement).style.transform = "translateY(0)"
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}

// ─── ROI Calculator ───────────────────────────────────────────────────────────
function RoiCalc() {
  const [ticket, setTicket] = useState(80)
  const [margen, setMargen] = useState(30)
  const [clientes, setClientes] = useState(15)
  const [incentivo, setIncentivo] = useState(10)

  const incentivos = clientes * ticket * (incentivo / 100)
  const bruto = clientes * ticket * (margen / 100)
  const neto = bruto - incentivos
  const roi = incentivos > 0 ? neto / incentivos : 0
  const eur = (n: number) => "€" + Math.round(n).toLocaleString("es-ES")

  const slider: React.CSSProperties = { width: "100%", accentColor: C.accent, cursor: "pointer", background: "transparent" }

  return (
    <div className="inc-roi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 48, textAlign: "left" }}>
      {/* Inputs */}
      <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 20, padding: 34, display: "flex", flexDirection: "column", gap: 26 }}>
        {[
          { label: "Ticket medio", val: ticket, set: setTicket, min: 20, max: 500, step: 5, fmt: `€${ticket}` },
          { label: "Margen neto", val: margen, set: setMargen, min: 5, max: 70, step: 1, fmt: `${margen}%` },
          { label: "Clientes/mes objetivo", val: clientes, set: setClientes, min: 1, max: 200, step: 1, fmt: `${clientes}` },
          { label: "Incentivo por conversión", val: incentivo, set: setIncentivo, min: 5, max: 25, step: 1, fmt: `${incentivo}%` },
        ].map(({ label, val, set, min, max, step, fmt }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{label}</span>
              <span style={{ fontFamily: F.brand, fontSize: 22, fontWeight: 800, color: C.text }}>{fmt}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(Number(e.target.value))} style={slider} />
          </div>
        ))}
      </div>
      {/* Result */}
      <div style={{ background: `linear-gradient(180deg, ${C.s2}, oklch(0.18 0.012 250))`, border: `1px solid oklch(0.32 0.02 250)`, borderRadius: 20, padding: 34, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pagarías en incentivos</div>
        <div style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 62, lineHeight: 1, marginTop: 10 }}>
          {eur(incentivos)}<span style={{ fontSize: 22, color: C.faint, fontWeight: 600 }}>/mes</span>
        </div>
        <div style={{ height: 1, background: "oklch(0.28 0.02 250)", margin: "26px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 14, color: C.muted }}>Margen neto estimado</span>
          <span style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 28 }}>{eur(neto)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.grad, borderRadius: 13, padding: "17px 22px", color: C.ink, marginTop: "auto" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Retorno por € invertido</span>
          <span style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 34 }}>{(Math.round(roi * 10) / 10).toFixed(1)}×</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main landing ─────────────────────────────────────────────────────────────
interface Props {
  locale: string
  confirmedThisMonth: number
  captadoresCount: number
  conversionRate: number
  paidThisWeek: number
}

export function LandingPage({ locale, confirmedThisMonth, paidThisWeek }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  useReveal(rootRef)
  const eur = (n: number) => "€" + Math.round(n).toLocaleString("es-ES")

  return (
    <div ref={rootRef} style={{ fontFamily: F.sans, background: C.bg, color: C.text, overflowX: "hidden", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav className="inc-nav" style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        background: "oklch(0.15 0.012 250 / 0.72)",
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid oklch(0.30 0.015 250 / 0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <Link href={`/${locale}`} style={{ textDecoration: "none" }}>
            <IncentisLogo size="sm" light />
          </Link>
          <div className="inc-nav-links" style={{ display: "flex", gap: 28, fontSize: 14, color: "oklch(0.74 0.01 250)", fontWeight: 500 }}>
            <a href="#como-funciona" style={{ color: "inherit", textDecoration: "none" }}>Cómo funciona</a>
            <a href="#niveles" style={{ color: "inherit", textDecoration: "none" }}>Niveles</a>
            <a href="#roi" style={{ color: "inherit", textDecoration: "none" }}>Calculadora</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href={`/${locale}/login`} style={{ fontSize: 14, color: "oklch(0.82 0.01 250)", fontWeight: 500, textDecoration: "none" }}>Entrar</Link>
          <Link href={`/${locale}/register/empresa`} style={{ fontSize: 14, fontWeight: 700, color: C.ink, background: C.accent, padding: "10px 20px", borderRadius: 99, textDecoration: "none", whiteSpace: "nowrap" }}>Empezar →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="inc-hero" style={{ position: "relative", padding: "96px 48px 80px", maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ position: "absolute", top: -80, right: -120, width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, oklch(0.80 0.17 162 / 0.16), transparent 65%)", pointerEvents: "none" }} />
        <div className="inc-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 64, alignItems: "center", position: "relative" }}>
          {/* Left */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: F.mono, fontSize: 11.5, letterSpacing: "0.14em", color: C.accent, border: `1px solid oklch(0.40 0.06 250)`, padding: "7px 14px", borderRadius: 99, textTransform: "uppercase", fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, animation: "inc-pulse 2s infinite" }} />
              Captación verificada
            </div>
            <h1 className="inc-hero-h1" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 84, lineHeight: 0.92, letterSpacing: "-0.045em", margin: "26px 0 0" }}>
              Paga solo cuando traen un cliente <span style={{ color: C.accent }}>real.</span>
            </h1>
            <p className="inc-hero-lead" style={{ fontSize: 19, lineHeight: 1.55, color: C.muted, margin: "26px 0 0", maxWidth: 480 }}>
              Incentis convierte cualquier recomendación en una venta medible. Tú defines la recompensa. Nosotros verificamos el resultado.
            </p>
            <div style={{ display: "flex", gap: 13, marginTop: 36, flexWrap: "wrap" }}>
              <Link href={`/${locale}/register/empresa`} style={{ fontSize: 16, fontWeight: 700, color: C.ink, background: C.accent, padding: "16px 30px", borderRadius: 99, textDecoration: "none" }}>Soy empresa</Link>
              <Link href={`/${locale}/register/captador`} style={{ fontSize: 16, fontWeight: 600, color: C.text, border: "1px solid oklch(0.42 0.02 250)", padding: "16px 30px", borderRadius: 99, textDecoration: "none" }}>Quiero captar</Link>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: C.faint, marginTop: 26, letterSpacing: "0.03em" }}>
              Sin tarjeta · Activo en 10 minutos · RGPD
            </div>
          </div>

          {/* Floating card */}
          <div className="inc-hero-card" style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -40, background: "radial-gradient(circle at 60% 40%, oklch(0.80 0.17 162 / 0.18), transparent 70%)", filter: "blur(20px)" }} />
            <div style={{ position: "relative", background: `linear-gradient(180deg, ${C.s2}, oklch(0.18 0.012 250))`, border: "1px solid oklch(0.32 0.02 250)", borderRadius: 22, padding: 24, boxShadow: "0 40px 90px -30px rgba(0,0,0,.7)", animation: "inc-float 7s ease-in-out infinite" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: "0.04em" }}>incentis · vista previa</span>
                <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: C.accent, background: "oklch(0.80 0.17 162 / 0.14)", padding: "3px 8px", borderRadius: 5 }}>VISTA PREVIA</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 13 }}>
                <div style={{ background: "oklch(0.20 0.015 250)", border: "1px solid oklch(0.30 0.02 250)", borderRadius: 13, padding: 16 }}>
                  <div style={{ fontFamily: F.brand, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{confirmedThisMonth || 17}</div>
                  <div style={{ fontSize: 11, color: "oklch(0.62 0.01 250)", marginTop: 4 }}>Conversiones · mes</div>
                </div>
                <div style={{ background: C.grad, borderRadius: 13, padding: 16, color: C.ink }}>
                  <div style={{ fontFamily: F.brand, fontSize: 34, fontWeight: 800, lineHeight: 1 }}>€0</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, fontWeight: 600 }}>por adelantado</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "oklch(0.20 0.015 250)", border: "1px solid oklch(0.30 0.02 250)", borderRadius: 11, padding: "13px 15px", marginBottom: 13 }}>
                <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 500 }}>Pagado esta semana</span>
                <span style={{ fontFamily: F.brand, fontSize: 17, fontWeight: 800, color: C.accent }}>{paidThisWeek > 0 ? `+${eur(paidThisWeek)}` : "+€174"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[{ id: "A7", name: "Cena para 2", amount: "15€" }, { id: "B3", name: "Sesión spa", amount: "25€" }].map((item, i) => (
                  <div key={item.id}>
                    {i > 0 && <div style={{ height: 1, background: "oklch(0.28 0.02 250)" }} />}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 2px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 7, background: "oklch(0.26 0.02 250)", fontFamily: F.mono, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>{item.id}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: F.brand, fontSize: 14, fontWeight: 700 }}>{item.amount}</span>
                        <span style={{ fontSize: 10, fontFamily: F.mono, color: C.accent }}>✓ verif.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop: "1px solid oklch(0.30 0.015 250)", borderBottom: "1px solid oklch(0.30 0.015 250)", padding: "22px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", animation: "inc-marquee 28s linear infinite" }}>
          {[1, 2].map((k) => (
            <span className="inc-marquee-inner" key={k} style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
              <span style={{ color: "oklch(0.30 0.015 250)" }}>Reserva verificada&nbsp;&nbsp;·&nbsp;&nbsp;</span>
              <span style={{ color: C.accent }}>Incentivo acreditado</span>
              <span style={{ color: "oklch(0.30 0.015 250)" }}>&nbsp;&nbsp;·&nbsp;&nbsp;Captador cobra&nbsp;&nbsp;·&nbsp;&nbsp;</span>
              <span style={{ color: C.text }}>Anti-fraude</span>
              <span style={{ color: "oklch(0.30 0.015 250)" }}>&nbsp;&nbsp;·&nbsp;&nbsp;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="inc-steps-section" style={{ maxWidth: 1320, margin: "0 auto", padding: "120px 48px 40px" }}>
        <div className="inc-steps-header" data-reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 72, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Cómo funciona</div>
            <h2 className="inc-steps-h2" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 60, lineHeight: 0.96, letterSpacing: "-0.04em", margin: "18px 0 0" }}>Tres pasos.<br />Sin fricciones.</h2>
          </div>
          <p style={{ fontSize: 16, color: "oklch(0.70 0.01 250)", maxWidth: 320, lineHeight: 1.55, margin: "0 0 8px" }}>De la campaña al cobro verificado. Todo registrado, todo medible.</p>
        </div>

        {[
          {
            n: "01", title: "La empresa publica campaña e incentivo",
            desc: "Define el incentivo —fijo, porcentaje o bono—, la fecha y el límite de conversiones. Activo en minutos.",
            card: (
              <div className="inc-step-card" style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint }}>Nueva campaña</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 10 }}>Trae amigos a cenar</div>
                <div style={{ fontSize: 13, color: "oklch(0.70 0.01 250)", marginTop: 4 }}>€15 por reserva confirmada</div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <span style={{ fontSize: 11, fontFamily: F.mono, color: C.accent, background: "oklch(0.80 0.17 162 / 0.12)", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>● ACTIVA</span>
                  <span style={{ fontSize: 11, fontFamily: F.mono, color: C.faint, background: "oklch(0.24 0.02 250)", padding: "4px 10px", borderRadius: 6 }}>Sin fecha fin</span>
                </div>
              </div>
            ),
          },
          {
            n: "02", title: "Los captadores comparten su QR único",
            desc: "Cada captador tiene un QR personal por campaña. Lo comparte con quien quiera — de forma anónima.",
            card: (
              <div className="inc-step-card" style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 74, height: 74, borderRadius: 12, background: "repeating-conic-gradient(#0c0c0a 0% 25%, #fff 0% 50%) 0/14px 14px", flexShrink: 0, border: "3px solid #fff" }} />
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint }}>QR personal · Captador #A7</div>
                  <div style={{ fontFamily: F.mono, fontSize: 13, color: C.accent, marginTop: 8 }}>incentis.app/scan/xk9q…</div>
                </div>
              </div>
            ),
          },
          {
            n: "03", title: "El cliente convierte, el captador cobra en 48 h",
            desc: "El staff escanea el QR al llegar el cliente. La plataforma verifica, acredita el incentivo y notifica al captador.",
            card: (
              <div className="inc-step-card" style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Reserva verificada</span>
                  <span style={{ fontFamily: F.mono, fontSize: 12, color: "oklch(0.70 0.01 250)" }}>20:00</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.grad, borderRadius: 11, padding: "13px 15px", marginTop: 14, color: C.ink }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Incentivo acreditado</span>
                  <span style={{ fontFamily: F.brand, fontSize: 18, fontWeight: 800 }}>+€15</span>
                </div>
              </div>
            ),
          },
        ].map((step, i) => (
          <div key={step.n} className="inc-step" data-reveal style={{
            display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 48,
            alignItems: "center", padding: "48px 0",
            borderTop: "1px solid oklch(0.28 0.015 250)",
            ...(i === 2 ? { borderBottom: "1px solid oklch(0.28 0.015 250)" } : {}),
          }}>
            <div className="inc-step-num" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 72, color: "oklch(0.32 0.02 250)", lineHeight: 1 }}>{step.n}</div>
            <div>
              <h3 className="inc-step-h3" style={{ fontFamily: F.brand, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", margin: 0 }}>{step.title}</h3>
              <p style={{ fontSize: 16, color: "oklch(0.70 0.01 250)", lineHeight: 1.55, margin: "14px 0 0" }}>{step.desc}</p>
            </div>
            {step.card}
          </div>
        ))}
      </section>

      {/* ── ROI CALCULATOR ── */}
      <section id="roi" className="inc-roi-section" style={{ padding: "140px 48px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, oklch(0.80 0.17 162 / 0.10), transparent 60%)", pointerEvents: "none" }} />
        <div data-reveal style={{ position: "relative", maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Calculadora de ROI</div>
          <h2 className="inc-roi-h2" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 60, lineHeight: 0.96, letterSpacing: "-0.04em", margin: "16px 0 0" }}>¿Cuánto te costaría un cliente real?</h2>
          <p className="inc-roi-lead" style={{ fontSize: 18, color: "oklch(0.70 0.01 250)", margin: "16px auto 0", maxWidth: 560, lineHeight: 1.55 }}>
            Solo pagas cuando la conversión ocurre. Ajusta los valores y mira la proyección para tu negocio.
          </p>
          <RoiCalc />
          <p style={{ fontFamily: F.mono, fontSize: 11, color: "oklch(0.55 0.01 250)", marginTop: 22, letterSpacing: "0.02em" }}>
            * Estimación orientativa. Incentis está en fase de lanzamiento — aún no hay datos históricos.
          </p>
        </div>
      </section>

      {/* ── ANTI-FRAUDE + ANONIMATO ── */}
      <section className="inc-antifraud" style={{ background: C.lightBg, color: C.ink, padding: "120px 48px" }}>
        <div className="inc-antifraud-grid" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div data-reveal style={{ background: "#fff", border: "1px solid oklch(0.90 0.006 250)", borderRadius: 24, padding: 48 }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.14em", color: C.accentOnLight, textTransform: "uppercase", fontWeight: 600 }}>Atribución anti-fraude</div>
            <h3 className="inc-antifraud-h3" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 42, letterSpacing: "-0.03em", margin: "18px 0 0", lineHeight: 1 }}>Cada conversión, verificada.</h3>
            <p style={{ fontSize: 16, color: "oklch(0.45 0.01 250)", lineHeight: 1.55, margin: "18px 0 28px" }}>
              QR de un solo uso por reserva. KYC del captador antes del primer pago. Sistema anti-self-referral automático.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["QR de un solo uso por reserva", "KYC verificado antes del pago", "Anti-self-referral automático", "Historial inmutable de conversiones"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "oklch(0.97 0.006 250)", borderRadius: 11, padding: "13px 16px" }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{item}</span>
                  <span style={{ color: C.accentOnLight, fontWeight: 700 }}>✓</span>
                </div>
              ))}
            </div>
          </div>
          <div data-reveal style={{ background: "#0c0c0a", color: C.text, borderRadius: 24, padding: 48, display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.14em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Para captadores</div>
            <h3 className="inc-antifraud-h3" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 42, letterSpacing: "-0.03em", margin: "18px 0 0", lineHeight: 1 }}>Anonimato total.<br />Cobro real.</h3>
            <p style={{ fontSize: 16, color: "oklch(0.72 0.01 250)", lineHeight: 1.55, margin: "18px 0 28px" }}>
              El cliente final nunca sabe quién recomendó. Tu empleador no sabe que captas. El pago va a tu cuenta personal.
            </p>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 18, background: "oklch(0.20 0.015 250)", border: "1px solid oklch(0.30 0.02 250)", borderRadius: 18, padding: 24 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "oklch(0.26 0.02 250)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: C.faint, flexShrink: 0 }}>?</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Captador anónimo</div>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: "oklch(0.62 0.01 250)", marginTop: 3 }}>Identidad protegida · KYC interno</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: "oklch(0.62 0.01 250)" }}>cuenta personal</div>
                <div style={{ fontFamily: F.brand, fontSize: 24, fontWeight: 800, color: C.accent }}>€15 →</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NIVELES ── */}
      <section id="niveles" className="inc-niveles" style={{ maxWidth: 1320, margin: "0 auto", padding: "120px 48px" }}>
        <div data-reveal style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Programa de niveles</div>
          <h2 className="inc-niveles-h2" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 60, letterSpacing: "-0.04em", margin: "16px 0 0", lineHeight: 0.96 }}>Cuanto más captas, más ganas.</h2>
        </div>
        <div className="inc-niveles-grid" data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { name: "Bronze", range: "0–9 conv.", mult: "1×", multColor: C.faint, payout: "payout 72h", bg: C.s1, border: C.border, color: C.text },
            { name: "Silver", range: "10–29 conv.", mult: "1.25×", multColor: "oklch(0.78 0.01 250)", payout: "payout 48h", bg: C.s1, border: C.border, color: C.text },
            { name: "Gold", range: "30–99 conv.", mult: "1.5×", multColor: C.ink, payout: "payout 24h", bg: C.grad, border: "none", color: C.ink, popular: true },
            { name: "Platinum", range: "100+ conv.", mult: "2×", multColor: C.text, payout: "payout 12h", bg: C.s1, border: C.borderStrong, color: C.text },
          ].map((tier) => (
            <div key={tier.name} style={{ background: tier.bg, border: tier.border !== "none" ? `1px solid ${tier.border}` : undefined, borderRadius: 18, padding: 28, position: "relative", color: tier.color }}>
              {tier.popular && (
                <span style={{ position: "absolute", top: 16, right: 16, fontFamily: F.mono, fontSize: 10, fontWeight: 600, background: C.ink, color: C.accent, padding: "4px 9px", borderRadius: 6 }}>POPULAR</span>
              )}
              <div style={{ fontFamily: F.brand, fontWeight: 700, fontSize: 22 }}>{tier.name}</div>
              <div style={{ fontSize: 12, color: tier.popular ? undefined : "oklch(0.62 0.01 250)", opacity: tier.popular ? 0.65 : 1, marginTop: 4 }}>{tier.range}</div>
              <div className="inc-niveles-mult" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 52, marginTop: 24, color: tier.multColor }}>{tier.mult}</div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: tier.popular ? undefined : "oklch(0.55 0.01 250)", opacity: tier.popular ? 0.7 : 1, marginTop: 8 }}>{tier.payout}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRAMA FUNDADOR ── */}
      <section className="inc-founder" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 48px 120px", textAlign: "center" }}>
        <div className="inc-founder-card" data-reveal style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 28, padding: "64px 56px" }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Programa fundador</div>
          <p className="inc-founder-title" style={{ fontFamily: F.brand, fontWeight: 700, fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.02em", margin: "18px auto 0", maxWidth: 720 }}>
            Estamos en fase de lanzamiento. Sé de los primeros negocios en Incentis.
          </p>
          <p style={{ fontSize: 16, color: "oklch(0.70 0.01 250)", lineHeight: 1.55, margin: "18px auto 0", maxWidth: 540 }}>
            Los negocios fundadores entran con onboarding asistido 1:1, comisión reducida de por vida y línea directa con el equipo. Sin permanencia, sin tarjeta.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 34 }}>
            <Link href={`/${locale}/register/empresa`} style={{ fontSize: 16, fontWeight: 700, color: C.ink, background: C.accent, padding: "16px 30px", borderRadius: 99, textDecoration: "none" }}>Solicitar acceso fundador →</Link>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 30, fontFamily: F.mono, fontSize: 12, color: "oklch(0.58 0.01 250)", flexWrap: "wrap" }}>
            <span>Plazas limitadas</span><span style={{ opacity: 0.4 }}>·</span>
            <span>Comisión reducida de por vida</span><span style={{ opacity: 0.4 }}>·</span>
            <span>Onboarding 1:1</span>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="inc-cta-wrap" style={{ padding: "0 48px 80px" }}>
        <div className="inc-cta-inner" data-reveal style={{ maxWidth: 1320, margin: "0 auto", background: `linear-gradient(135deg, oklch(0.80 0.17 162), ${C.accentDeeper})`, borderRadius: 32, padding: "96px 64px", textAlign: "center", color: C.ink, position: "relative", overflow: "hidden" }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, opacity: 0.6 }}>Empieza hoy</div>
          <h2 className="inc-cta-h2" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 72, lineHeight: 0.94, letterSpacing: "-0.04em", margin: "18px auto 0", maxWidth: 760 }}>
            Paga solo cuando traen un cliente real.
          </h2>
          <p style={{ fontSize: 18, margin: "20px 0 0", fontWeight: 500, opacity: 0.7 }}>Sin tarjeta · Sin fee mensual · Activo en 10 minutos.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 13, marginTop: 40, flexWrap: "wrap" }}>
            <Link href={`/${locale}/register/empresa`} style={{ fontSize: 16, fontWeight: 700, color: C.text, background: C.ink, padding: "17px 34px", borderRadius: 99, textDecoration: "none" }}>Soy empresa</Link>
            <Link href={`/${locale}/register/captador`} style={{ fontSize: 16, fontWeight: 700, color: C.ink, background: "#fff", padding: "17px 34px", borderRadius: 99, textDecoration: "none" }}>Quiero captar</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="inc-footer" style={{ borderTop: "1px solid oklch(0.28 0.015 250)", padding: 48, maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <IncentisLogo size="sm" light />
          <span style={{ fontSize: 13, color: "oklch(0.55 0.01 250)" }}>Captación verificada. Solo pagas por resultado.</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: F.mono, fontSize: 11, color: "oklch(0.55 0.01 250)", flexWrap: "wrap" }}>
          <span style={{ border: "1px solid oklch(0.30 0.02 250)", padding: "5px 10px", borderRadius: 6 }}>✓ Stripe</span>
          <span style={{ border: "1px solid oklch(0.30 0.02 250)", padding: "5px 10px", borderRadius: 6 }}>✓ RGPD</span>
          <Link href={`/${locale}/legal`} style={{ color: "oklch(0.55 0.01 250)", textDecoration: "none" }}>Aviso legal</Link>
          <Link href={`/${locale}/privacidad`} style={{ color: "oklch(0.55 0.01 250)", textDecoration: "none" }}>Privacidad</Link>
          <span>© 2026 Incentis</span>
        </div>
      </footer>
    </div>
  )
}
