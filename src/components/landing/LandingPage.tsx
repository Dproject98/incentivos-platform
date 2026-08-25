"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { IncentisLogo } from "@/components/IncentisLogo"

gsap.registerPlugin(ScrollTrigger)

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#16171A",
  s1: "#1E2023",
  s2: "#26282C",
  border: "#34373C",
  borderStrong: "#383B40",
  text: "#F2F1EF",
  muted: "#AEB2B8",
  faint: "#868A90",
  accent: "oklch(0.70 0.15 35)",
  accentDeep: "oklch(0.60 0.16 40)",
  accentDeeper: "oklch(0.54 0.15 38)",
  accentOnLight: "oklch(0.60 0.16 40)",
  lightBg: "oklch(0.96 0.008 250)",
  ink: "#16171A",
  grad: "linear-gradient(135deg, oklch(0.70 0.15 35), oklch(0.60 0.16 40))",
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

// ─── Hero: profundidad ligada al scroll (estilo Apple: pin + scrub) ───────────
// Todo — el pin de 220vh, el sticky del header y el tilt — vive detras de UNA
// sola condicion (desktop + sin prefers-reduced-motion), aplicada con gsap
// para que la limpieza de gsap.matchMedia() la deshaga entera de una vez.
// Antes el pin/sticky se ponian siempre por CSS y solo el tween se gateaba
// en JS: alguien en desktop con reduced-motion se comia 220vh de scroll
// muerto sin ningun tilt que lo justificase. Con esto, si no va a animar
// nada, tampoco reserva ese scroll extra.
function useHeroTilt(
  pinRef: React.RefObject<HTMLDivElement | null>,
  cardRef: React.RefObject<HTMLDivElement | null>,
  textRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const mm = gsap.matchMedia()
    let rafId = 0

    mm.add(
      { desktop: "(min-width: 1025px)", motionOk: "(prefers-reduced-motion: no-preference)" },
      (context) => {
        const { desktop, motionOk } = context.conditions as { desktop: boolean; motionOk: boolean }
        if (!desktop || !motionOk) return
        const header = pinRef.current?.querySelector<HTMLElement>(".inc-hero")
        if (!pinRef.current || !cardRef.current || !textRef.current || !header) return

        gsap.set(pinRef.current, { height: "220vh" })
        gsap.set(header, { position: "sticky", top: 0 })

        gsap.timeline({
          scrollTrigger: { trigger: pinRef.current, start: "top top", end: "bottom top", scrub: true },
        })
          .to(cardRef.current, { rotateX: -10, rotateY: 8, y: -50, scale: 0.92, ease: "none" }, 0)
          .to(textRef.current, { y: -30, opacity: 0.35, ease: "none" }, 0)

        // Las fuentes de next/font y los stats dinamicos pueden desplazar el
        // layout despues del primer paint — recalcula las medidas del pin.
        rafId = requestAnimationFrame(() => ScrollTrigger.refresh())
      }
    )

    return () => {
      cancelAnimationFrame(rafId)
      mm.revert()
    }
  }, [])
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
      <div style={{ background: `linear-gradient(180deg, ${C.s2}, #1C1D20)`, border: `1px solid #383B40`, borderRadius: 20, padding: 34, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pagarías en incentivos</div>
        <div style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 62, lineHeight: 1, marginTop: 10 }}>
          {eur(incentivos)}<span style={{ fontSize: 22, color: C.faint, fontWeight: 600 }}>/mes</span>
        </div>
        <div style={{ height: 1, background: "#2C2E32", margin: "26px 0" }} />
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
  const heroPinRef = useRef<HTMLDivElement>(null)
  const heroCardRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  useHeroTilt(heroPinRef, heroCardRef, heroTextRef)
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
      {/* Contenedor "pin": scroll extra que el header consume quedandose fijo
          (sticky) mientras la tarjeta gana profundidad — estilo Apple product page.
          Se anula en tablet/movil via .inc-hero-pin en globals.css. */}
      {/* height/position por defecto son "sin cine": auto/static. useHeroTilt
          (más abajo) los sube a 220vh/sticky con gsap SOLO si va a animar algo
          de verdad (desktop + sin prefers-reduced-motion) — una sola fuente
          de verdad en vez de CSS y JS gateando cosas distintas por separado. */}
      <div ref={heroPinRef} className="inc-hero-pin" style={{ position: "relative" }}>
        <header className="inc-hero" style={{ zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", padding: "96px 48px 80px", maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ position: "absolute", top: -80, right: -120, width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, oklch(0.70 0.15 35 / 0.16), transparent 65%)", pointerEvents: "none" }} />
        <div className="inc-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 64, alignItems: "center", position: "relative", perspective: 1400, width: "100%" }}>
          {/* Left */}
          <div ref={heroTextRef}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: F.mono, fontSize: 11.5, letterSpacing: "0.14em", color: C.accent, border: `1px solid #383B40`, padding: "7px 14px", borderRadius: 99, textTransform: "uppercase", fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, animation: "inc-pulse 2s infinite" }} />
              Captación verificada
            </div>
            <h1 className="inc-hero-h1" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: "clamp(42px, 6.2vw, 84px)", lineHeight: 0.92, letterSpacing: "-0.045em", margin: "26px 0 0" }}>
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

          {/* Floating card — tratamiento "material": cristal traslucido con
              profundidad, en vez de panel opaco tipo admin. */}
          <div ref={heroCardRef} className="inc-hero-card" style={{ position: "relative", transformStyle: "preserve-3d", willChange: "transform" }}>
            <div style={{ position: "absolute", inset: -40, background: "radial-gradient(circle at 60% 40%, oklch(0.70 0.15 35 / 0.20), transparent 70%)", filter: "blur(28px)" }} />
            <div style={{
              position: "relative",
              background: "rgba(30, 32, 35, 0.68)",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 26,
              padding: 26,
              boxShadow: "0 55px 110px -30px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,0.03)",
              animation: "inc-float 7s ease-in-out infinite",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: C.accent, animation: "inc-pulse 2s infinite", flexShrink: 0 }} />
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: "0.06em" }}>incentis · en vivo</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 13 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 15, padding: 16 }}>
                  <div style={{ fontFamily: F.brand, fontSize: 38, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>{confirmedThisMonth || 17}</div>
                  <div style={{ fontSize: 11, color: "#93979E", marginTop: 4 }}>Conversiones · mes</div>
                </div>
                <div style={{ background: C.grad, borderRadius: 15, padding: 16, color: C.ink }}>
                  <div style={{ fontFamily: F.brand, fontSize: 34, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>€0</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, fontWeight: 600 }}>por adelantado</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 13, padding: "13px 15px", marginBottom: 13 }}>
                <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 500 }}>Pagado esta semana</span>
                <span style={{ fontFamily: F.brand, fontSize: 17, fontWeight: 800, color: C.accent }}>{paidThisWeek > 0 ? `+${eur(paidThisWeek)}` : "+€174"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[{ id: "A7", name: "Cena para 2", amount: "15€" }, { id: "B3", name: "Sesión spa", amount: "25€" }].map((item, i) => (
                  <div key={item.id}>
                    {i > 0 && <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 2px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,0.03)", fontFamily: F.mono, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>{item.id}</span>
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
      </div>

      {/* ── MARQUEE ── */}
      <div style={{ borderTop: "1px solid #34373C", borderBottom: "1px solid #34373C", padding: "22px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", animation: "inc-marquee 28s linear infinite" }}>
          {[1, 2].map((k) => (
            <span className="inc-marquee-inner" key={k} style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 30, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
              <span style={{ color: "#34373C" }}>Reserva verificada&nbsp;&nbsp;·&nbsp;&nbsp;</span>
              <span style={{ color: C.accent }}>Incentivo acreditado</span>
              <span style={{ color: "#34373C" }}>&nbsp;&nbsp;·&nbsp;&nbsp;Captador cobra&nbsp;&nbsp;·&nbsp;&nbsp;</span>
              <span style={{ color: C.text }}>Anti-fraude</span>
              <span style={{ color: "#34373C" }}>&nbsp;&nbsp;·&nbsp;&nbsp;</span>
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
          <p style={{ fontSize: 16, color: "#A4A8AE", maxWidth: 320, lineHeight: 1.55, margin: "0 0 8px" }}>De la campaña al cobro verificado. Todo registrado, todo medible.</p>
        </div>

        {[
          {
            n: "01", title: "La empresa publica campaña e incentivo",
            desc: "Define el incentivo —fijo, porcentaje o bono—, la fecha y el límite de conversiones. Activo en minutos.",
            card: (
              <div className="inc-step-card" style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: C.faint }}>Nueva campaña</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 10 }}>Trae amigos a cenar</div>
                <div style={{ fontSize: 13, color: "#A4A8AE", marginTop: 4 }}>€15 por reserva confirmada</div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <span style={{ fontSize: 11, fontFamily: F.mono, color: C.accent, background: "oklch(0.70 0.15 35 / 0.12)", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>● ACTIVA</span>
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
                <div style={{ width: 74, height: 74, borderRadius: 12, background: "repeating-conic-gradient(#16171A 0% 25%, #fff 0% 50%) 0/14px 14px", flexShrink: 0, border: "3px solid #fff" }} />
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
                  <span style={{ fontFamily: F.mono, fontSize: 12, color: "#A4A8AE" }}>20:00</span>
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
            borderTop: "1px solid #2C2E32",
            ...(i === 2 ? { borderBottom: "1px solid #2C2E32" } : {}),
          }}>
            <div className="inc-step-num" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 72, color: "#383B40", lineHeight: 1 }}>{step.n}</div>
            <div>
              <h3 className="inc-step-h3" style={{ fontFamily: F.brand, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", margin: 0 }}>{step.title}</h3>
              <p style={{ fontSize: 16, color: "#A4A8AE", lineHeight: 1.55, margin: "14px 0 0" }}>{step.desc}</p>
            </div>
            {step.card}
          </div>
        ))}
      </section>

      {/* ── ROI CALCULATOR ── */}
      <section id="roi" className="inc-roi-section" style={{ padding: "140px 48px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, oklch(0.70 0.15 35 / 0.10), transparent 60%)", pointerEvents: "none" }} />
        <div data-reveal style={{ position: "relative", maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Calculadora de ROI</div>
          <h2 className="inc-roi-h2" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 60, lineHeight: 0.96, letterSpacing: "-0.04em", margin: "16px 0 0" }}>¿Cuánto te costaría un cliente real?</h2>
          <p className="inc-roi-lead" style={{ fontSize: 18, color: "#A4A8AE", margin: "16px auto 0", maxWidth: 560, lineHeight: 1.55 }}>
            Solo pagas cuando la conversión ocurre. Ajusta los valores y mira la proyección para tu negocio.
          </p>
          <RoiCalc />
          <p style={{ fontFamily: F.mono, fontSize: 11, color: "#7C8087", marginTop: 22, letterSpacing: "0.02em" }}>
            * Estimación orientativa. Incentis está en fase de lanzamiento — aún no hay datos históricos.
          </p>
        </div>
      </section>

      {/* ── ANTI-FRAUDE + ANONIMATO ── */}
      {/* El contraste claro/oscuro sigue significando algo real (confianza
          para el negocio vs. anonimato para el captador) — lo que se quita
          es que cada mitad fuera ademas una "tarjeta" con su propio borde
          y radio flotando sobre un fondo. Ahora el color de cada mitad ES
          el fondo de la seccion, sin caja alrededor. */}
      <section className="inc-antifraud" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div className="inc-antifraud-half" data-reveal style={{ background: C.lightBg, color: C.ink, padding: "100px 56px" }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.14em", color: C.accentOnLight, textTransform: "uppercase", fontWeight: 600 }}>Atribución anti-fraude</div>
          <h3 className="inc-antifraud-h3" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 42, letterSpacing: "-0.03em", margin: "18px 0 0", lineHeight: 1 }}>Cada conversión, verificada.</h3>
          <p style={{ fontSize: 16, color: "#5C6066", lineHeight: 1.55, margin: "18px 0 28px", maxWidth: 420 }}>
            QR de un solo uso por reserva. KYC del captador antes del primer pago. Sistema anti-self-referral automático.
          </p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {["QR de un solo uso por reserva", "KYC verificado antes del pago", "Anti-self-referral automático", "Historial inmutable de conversiones"].map((item, i) => (
              <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderTop: i > 0 ? "1px solid #E4E2DE" : "none" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item}</span>
                <span style={{ color: C.accentOnLight, fontWeight: 700 }}>✓</span>
              </div>
            ))}
          </div>
        </div>
        <div className="inc-antifraud-half" data-reveal style={{ background: "#16171A", color: C.text, padding: "100px 56px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.14em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Para captadores</div>
          <h3 className="inc-antifraud-h3" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 42, letterSpacing: "-0.03em", margin: "18px 0 0", lineHeight: 1 }}>Anonimato total.<br />Cobro real.</h3>
          <p style={{ fontSize: 16, color: "#AEB2B8", lineHeight: 1.55, margin: "18px 0 28px", maxWidth: 420 }}>
            El cliente final nunca sabe quién recomendó. Tu empleador no sabe que captas. El pago va a tu cuenta personal.
          </p>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 18, borderTop: "1px solid #34373C", paddingTop: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#292B2F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.faint, flexShrink: 0 }}>?</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Captador anónimo</div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: "#93979E", marginTop: 3 }}>Identidad protegida · KYC interno</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: "#93979E" }}>cuenta personal</div>
              <div style={{ fontFamily: F.brand, fontSize: 24, fontWeight: 800, color: C.accent }}>€15 →</div>
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
        {/* Una sola hoja de especificaciones con divisores internos, en vez
            de 4 tarjetas de precios sueltas — la caja es el conjunto, no
            cada nivel por separado. */}
        <div className="inc-niveles-grid" data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden" }}>
          {[
            { name: "Bronze", range: "0–9 conv.", mult: "1×", payout: "payout 72h" },
            { name: "Silver", range: "10–29 conv.", mult: "1.25×", payout: "payout 48h" },
            { name: "Gold", range: "30–99 conv.", mult: "1.5×", payout: "payout 24h", popular: true },
            { name: "Platinum", range: "100+ conv.", mult: "2×", payout: "payout 12h" },
          ].map((tier, i) => (
            <div key={tier.name} style={{
              padding: "32px 24px",
              borderLeft: i > 0 ? `1px solid ${C.border}` : "none",
              background: tier.popular ? "oklch(0.70 0.15 35 / 0.06)" : "transparent",
              position: "relative",
            }}>
              {tier.popular && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: C.grad }} />
              )}
              <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.06em", color: tier.popular ? C.accent : "#93979E", textTransform: "uppercase", fontWeight: 600 }}>{tier.name}</div>
              <div style={{ fontSize: 12, color: "#7C8087", marginTop: 4 }}>{tier.range}</div>
              <div className="inc-niveles-mult" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: 48, marginTop: 22, letterSpacing: "-0.02em", color: C.text }}>{tier.mult}</div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: "#7C8087", marginTop: 8 }}>{tier.payout}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CIERRE ── */}
      {/* Antes eran dos secciones distintas (Programa fundador + CTA final)
          cada una metida en su propia caja redondeada con fondo de color —
          el patron de "banner" generico. Apple no encierra sus cierres en
          rectangulos flotantes: el fondo de la seccion ES el color, el texto
          y los botones van directos encima. Fusionadas en un solo cierre,
          sin caja, sin repetir el mismo mensaje dos veces. */}
      <section className="inc-close" style={{ position: "relative", padding: "160px 48px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 900px 500px at 50% 0%, oklch(0.70 0.15 35 / 0.16), transparent 70%)", pointerEvents: "none" }} />
        <div data-reveal style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>
          <div style={{ fontFamily: F.mono, fontSize: 12, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Programa fundador · plazas limitadas</div>
          <h2 className="inc-close-h2" style={{ fontFamily: F.brand, fontWeight: 800, fontSize: "clamp(38px, 5.2vw, 72px)", lineHeight: 0.96, letterSpacing: "-0.04em", margin: "20px 0 0" }}>
            Paga solo cuando traen un cliente real.
          </h2>
          <p style={{ fontSize: 18, color: "#A4A8AE", lineHeight: 1.55, margin: "22px auto 0", maxWidth: 520 }}>
            Los negocios fundadores entran con onboarding asistido 1:1 y comisión reducida de por vida. Sin tarjeta, sin permanencia, activo en 10 minutos.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 13, marginTop: 40, flexWrap: "wrap" }}>
            <Link href={`/${locale}/register/empresa`} style={{ fontSize: 16, fontWeight: 700, color: C.ink, background: C.accent, padding: "16px 32px", borderRadius: 99, textDecoration: "none" }}>Solicitar acceso fundador →</Link>
            <Link href={`/${locale}/register/captador`} style={{ fontSize: 16, fontWeight: 600, color: C.text, border: `1px solid ${C.border}`, padding: "16px 32px", borderRadius: 99, textDecoration: "none" }}>Quiero captar</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="inc-footer" style={{ borderTop: "1px solid #2C2E32", padding: 48, maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <IncentisLogo size="sm" light />
          <span style={{ fontSize: 13, color: "#7C8087" }}>Captación verificada. Solo pagas por resultado.</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: F.mono, fontSize: 11, color: "#7C8087", flexWrap: "wrap" }}>
          <span style={{ border: "1px solid #34373C", padding: "5px 10px", borderRadius: 6 }}>✓ Stripe</span>
          <span style={{ border: "1px solid #34373C", padding: "5px 10px", borderRadius: 6 }}>✓ RGPD</span>
          <Link href={`/${locale}/legal`} style={{ color: "#7C8087", textDecoration: "none" }}>Aviso legal</Link>
          <Link href={`/${locale}/privacidad`} style={{ color: "#7C8087", textDecoration: "none" }}>Privacidad</Link>
          <span>© 2026 Incentis</span>
        </div>
      </footer>
    </div>
  )
}
