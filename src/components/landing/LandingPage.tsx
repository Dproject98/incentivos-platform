"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { IncentisLogo } from "@/components/IncentisLogo"

/* ─────────────────────────────────────────────────────────────────────────────
   REDISEÑO v2 — "Libro de cuentas"

   Se descarta por completo el lenguaje anterior (fondo oscuro + acento neón +
   secciones metidas en tarjetas redondeadas). El producto no es una app de
   dashboards: es un registro verificado de transacciones entre dos personas
   que nunca se ven. Asi que la pagina se comporta como un libro de cuentas —
   papel, tinta, reglas finas, cifras alineadas — con un unico color de señal.

   Sin fotografia de stock: los simbolos son SVG propios. El central es la
   figura anonima cuyo rostro es un QR — el producto entero en una imagen.
   ────────────────────────────────────────────────────────────────────────── */

const C = {
  paper:  "#EAE7E0",   // fondo hueso, calido pero no crema
  paper2: "#F5F3EF",   // superficie elevada
  ink:    "#14171A",   // casi negro, ligeramente frio
  ink2:   "#4A5157",
  faint:  "#8B9299",
  line:   "#CFCAC2",
  lineInk:"#2C3237",
  signal: "#1B3BFF",   // ultramar electrico — el unico color fuerte
  signalSoft: "rgba(27,59,255,0.07)",
}

const F = {
  display: "var(--font-archivo), 'Archivo', system-ui, sans-serif",
  body:    "var(--font-body), 'Inter Tight', system-ui, sans-serif",
  mono:    "var(--font-mono), 'JetBrains Mono', monospace",
}

const eur = (n: number) => "€" + Math.round(n).toLocaleString("es-ES")

/* ── Reveal on scroll ─────────────────────────────────────────────────────── */
function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    // Respeta reduced-motion: sin desplazamiento, el contenido ya esta visible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const vh = window.innerHeight || 800
    const els = Array.from(root.querySelectorAll("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > vh * 0.9
    ) as HTMLElement[]
    els.forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(18px)"
      el.style.transition = "opacity .7s cubic-bezier(.23,1,.32,1), transform .7s cubic-bezier(.23,1,.32,1)"
    })
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
          io.unobserve(el)
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}

/* ── Simbolos ─────────────────────────────────────────────────────────────── */

/** El simbolo central: una figura cuyo rostro es un codigo QR.
 *  Identidad sustituida por codigo — anonimato y verificacion a la vez. */
function AnonQRMark({ size = 260, ink = C.ink, signal = C.signal }: { size?: number; ink?: string; signal?: string }) {
  // Patron pseudo-QR fijo (no aleatorio: evita hydration mismatch SSR/cliente).
  const cells = [
    [2,2],[3,2],[4,2],[6,2],[8,2],[9,2],
    [2,3],[4,3],[7,3],[9,3],
    [2,4],[3,4],[4,4],[6,4],[8,4],
    [6,5],[7,5],[9,5],
    [2,6],[4,6],[5,6],[7,6],[9,6],
    [2,7],[3,7],[5,7],[8,7],[9,7],
    [3,8],[4,8],[6,8],[7,8],[9,8],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Captador anónimo verificado por código">
      {/* hombros */}
      <path d="M18 120 C18 96 36 84 60 84 C84 84 102 96 102 120 Z" fill="none" stroke={ink} strokeWidth="1.6" />
      {/* cabeza */}
      <rect x="26" y="10" width="68" height="68" rx="6" fill="none" stroke={ink} strokeWidth="1.6" />
      {/* esquinas de registro del QR */}
      {[[32,16],[76,16],[32,60]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="12" height="12" fill="none" stroke={signal} strokeWidth="1.6" />
          <rect x={x + 4} y={y + 4} width="4" height="4" fill={signal} />
        </g>
      ))}
      {/* modulos */}
      {cells.map(([cx, cy]) => (
        <rect key={`${cx}-${cy}`} x={26 + cx * 6.8} y={10 + cy * 6.8} width="4.4" height="4.4" fill={ink} opacity="0.82" />
      ))}
    </svg>
  )
}

/** Sello de tinta: marca de verificacion, girada como estampada a mano. */
function StampMark({ size = 108, color = C.signal, label = "VERIFICADO" }: { size?: number; color?: string; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label} style={{ transform: "rotate(-11deg)" }}>
      <defs>
        <path id="stamp-arc" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
      </defs>
      <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="2.4" opacity="0.75" />
      <circle cx="60" cy="60" r="45" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      <text fontFamily={F.mono} fontSize="10.5" fontWeight="600" fill={color} letterSpacing="3.4" opacity="0.85">
        <textPath href="#stamp-arc" startOffset="50%" textAnchor="middle">{label}</textPath>
      </text>
      <path d="M42 61 L54 73 L79 47" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** El puente: dos columnas que nunca se tocan, unidas solo por el codigo. */
function BridgeMark({ leftLabel, rightLabel, ink, dim }: { leftLabel: string; rightLabel: string; ink: string; dim: string }) {
  return (
    <svg width="100%" viewBox="0 0 320 90" role="img" aria-label={`${leftLabel} y ${rightLabel} conectados solo por el código`} style={{ maxWidth: 320 }}>
      <rect x="6" y="26" width="52" height="52" rx="4" fill="none" stroke={ink} strokeWidth="1.4" />
      <rect x="262" y="26" width="52" height="52" rx="4" fill="none" stroke={ink} strokeWidth="1.4" />
      <text x="32" y="16" fontFamily={F.mono} fontSize="9" fill={dim} textAnchor="middle" letterSpacing="1.2">{leftLabel}</text>
      <text x="288" y="16" fontFamily={F.mono} fontSize="9" fill={dim} textAnchor="middle" letterSpacing="1.2">{rightLabel}</text>
      <line x1="64" y1="52" x2="126" y2="52" stroke={dim} strokeWidth="1.2" strokeDasharray="3 4" />
      <line x1="194" y1="52" x2="256" y2="52" stroke={dim} strokeWidth="1.2" strokeDasharray="3 4" />
      <rect x="132" y="24" width="56" height="56" rx="4" fill="none" stroke={C.signal} strokeWidth="1.6" />
      {[[0,0],[1,0],[3,0],[0,1],[2,1],[3,1],[1,2],[2,2],[0,3],[3,3]].map(([cx, cy]) => (
        <rect key={`${cx}-${cy}`} x={140 + cx * 11} y={32 + cy * 11} width="7" height="7" fill={C.signal} opacity="0.8" />
      ))}
    </svg>
  )
}

/* ── La cuenta (calculadora de ROI como una factura) ──────────────────────── */
function Cuenta() {
  const [ticket, setTicket] = useState(80)
  const [margen, setMargen] = useState(30)
  const [clientes, setClientes] = useState(15)
  const [incentivo, setIncentivo] = useState(10)

  const incentivos = clientes * ticket * (incentivo / 100)
  const bruto = clientes * ticket * (margen / 100)
  const neto = bruto - incentivos
  const roi = incentivos > 0 ? neto / incentivos : 0

  const rows: Array<{ label: string; val: number; set: (n: number) => void; min: number; max: number; step: number; fmt: string }> = [
    { label: "Ticket medio",           val: ticket,    set: setTicket,    min: 20, max: 500, step: 5, fmt: `€${ticket}` },
    { label: "Margen neto",            val: margen,    set: setMargen,    min: 5,  max: 70,  step: 1, fmt: `${margen}%` },
    { label: "Clientes al mes",        val: clientes,  set: setClientes,  min: 1,  max: 200, step: 1, fmt: `${clientes}` },
    { label: "Incentivo por conversión", val: incentivo, set: setIncentivo, min: 5,  max: 25,  step: 1, fmt: `${incentivo}%` },
  ]

  return (
    <div className="inc-cuenta" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: `1px solid ${C.line}`, background: C.paper2 }}>
      {/* Supuestos */}
      <div className="inc-cuenta-col" style={{ padding: "36px 40px", borderRight: `1px solid ${C.line}` }}>
        <div style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.16em", color: C.faint, textTransform: "uppercase" }}>Supuestos</div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column" }}>
          {rows.map(({ label, val, set, min, max, step, fmt }, i) => (
            <div key={label} style={{ padding: "18px 0", borderTop: i > 0 ? `1px solid ${C.line}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontSize: 14.5, color: C.ink2 }}>{label}</span>
                <span style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 600, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={val}
                onChange={(e) => set(Number(e.target.value))}
                aria-label={label}
                style={{ width: "100%", accentColor: C.signal, cursor: "pointer", background: "transparent" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Liquidacion */}
      <div className="inc-cuenta-col" style={{ padding: "36px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.16em", color: C.faint, textTransform: "uppercase" }}>Liquidación mensual</div>

        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14, fontFamily: F.mono, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.ink2 }}>Margen bruto generado</span>
            <span style={{ color: C.ink }}>{eur(bruto)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.ink2 }}>Incentivos pagados</span>
            <span style={{ color: C.ink }}>−{eur(incentivos)}</span>
          </div>
        </div>

        {/* doble regla: cierre de cuenta */}
        <div style={{ marginTop: 22, borderTop: `1px solid ${C.line}`, paddingTop: 3 }}>
          <div style={{ borderTop: `2px solid ${C.ink}` }} />
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.14em", color: C.faint, textTransform: "uppercase" }}>Margen neto</div>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: "clamp(44px, 5vw, 64px)", lineHeight: 1, letterSpacing: "-0.035em", color: C.ink, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
            {eur(neto)}
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 26, display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: `1px solid ${C.line}` }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.1em", color: C.faint, textTransform: "uppercase" }}>Retorno por € invertido</span>
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 34, color: C.signal, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {(Math.round(roi * 10) / 10).toFixed(1)}×
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Landing ──────────────────────────────────────────────────────────────── */
interface Props {
  locale: string
  confirmedThisMonth: number
  captadoresCount: number
  conversionRate: number
  paidThisWeek: number
}

export function LandingPage({ locale, confirmedThisMonth, captadoresCount, paidThisWeek }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  useReveal(rootRef)

  const asientos = [
    { ref: "A7", concepto: "Cena para dos · El Rincón del Born", importe: 15 },
    { ref: "B3", concepto: "Circuito spa · Hotel Boutique Palma", importe: 25 },
    { ref: "C1", concepto: "Menú degustación · El Rincón del Born", importe: 18 },
  ]

  const eyebrow: React.CSSProperties = {
    fontFamily: F.mono, fontSize: 10.5, letterSpacing: "0.18em",
    textTransform: "uppercase", color: C.signal, fontWeight: 600,
  }
  const h2: React.CSSProperties = {
    fontFamily: F.display, fontWeight: 800,
    fontSize: "clamp(34px, 4.6vw, 60px)", lineHeight: 1.0,
    letterSpacing: "-0.04em", color: C.ink, margin: "18px 0 0",
    textWrap: "balance" as React.CSSProperties["textWrap"],
  }

  return (
    <div ref={rootRef} style={{ fontFamily: F.body, background: C.paper, color: C.ink, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── NAV ── plana, sin cristal ni pildoras */}
      <nav className="inc-nav" style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", background: C.paper, borderBottom: `1px solid ${C.line}`,
      }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none" }}><IncentisLogo size="sm" /></Link>
        <div className="inc-nav-links" style={{ display: "flex", gap: 30, fontFamily: F.mono, fontSize: 12, letterSpacing: "0.04em", color: C.ink2 }}>
          <a href="#dos-lados" style={{ color: "inherit", textDecoration: "none" }}>Dos lados</a>
          <a href="#proceso" style={{ color: "inherit", textDecoration: "none" }}>Proceso</a>
          <a href="#cuenta" style={{ color: "inherit", textDecoration: "none" }}>La cuenta</a>
          <a href="#escala" style={{ color: "inherit", textDecoration: "none" }}>Escala</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Link href={`/${locale}/login`} style={{ fontFamily: F.mono, fontSize: 12, color: C.ink2, textDecoration: "none" }}>Entrar</Link>
          <Link href={`/${locale}/register/empresa`} style={{
            fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: C.signal,
            textDecoration: "none", borderBottom: `1.5px solid ${C.signal}`, paddingBottom: 2,
          }}>Empezar →</Link>
        </div>
      </nav>

      {/* ── APERTURA ── el titular es la tesis, sin tarjeta flotando al lado */}
      <header className="inc-open" style={{ padding: "clamp(56px, 9vw, 112px) 40px 0", maxWidth: 1400, margin: "0 auto" }}>
        <div className="inc-open-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 56, alignItems: "end" }}>
          <div>
            <div style={eyebrow}>Captación verificada · Mallorca</div>
            <h1 className="inc-open-h1" style={{
              fontFamily: F.display, fontWeight: 800,
              fontSize: "clamp(48px, 8.6vw, 132px)", lineHeight: 0.9,
              letterSpacing: "-0.05em", margin: "22px 0 0", textWrap: "balance",
            }}>
              paga solo cuando<br />traen a alguien<span style={{ color: C.signal }}>.</span>
            </h1>
            <p className="inc-open-lead" style={{ fontSize: 19, lineHeight: 1.5, color: C.ink2, margin: "30px 0 0", maxWidth: "46ch" }}>
              Alguien recomienda tu negocio sin que nadie sepa quién fue. El cliente llega,
              tu equipo escanea su código, y el incentivo se acredita solo. Ni un euro por adelantado.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 38, flexWrap: "wrap" }}>
              <Link href={`/${locale}/register/empresa`} style={{
                fontFamily: F.mono, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.02em",
                color: C.paper, background: C.ink, padding: "16px 28px", textDecoration: "none",
              }}>Soy un negocio</Link>
              <Link href={`/${locale}/register/captador`} style={{
                fontFamily: F.mono, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.02em",
                color: C.ink, background: "transparent", border: `1px solid ${C.ink}`,
                padding: "16px 28px", textDecoration: "none",
              }}>Quiero captar</Link>
            </div>
          </div>

          <div className="inc-open-mark" style={{ position: "relative", paddingBottom: 8 }}>
            <AnonQRMark size={280} />
            <div style={{ position: "absolute", right: -14, top: -6 }}><StampMark size={96} /></div>
          </div>
        </div>
      </header>

      {/* ── EL LIBRO ── asientos reales, como un libro de cuentas abierto */}
      <section className="inc-libro" style={{ padding: "clamp(56px, 8vw, 96px) 40px 0", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: `2px solid ${C.ink}`, paddingBottom: 12, flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink }}>Libro de conversiones</span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: "0.04em" }}>
            {confirmedThisMonth || 17} este mes · {captadoresCount || 3} captadores activos
          </span>
        </div>

        {asientos.map((a, i) => (
          <div key={a.ref} className="inc-asiento" data-reveal style={{
            display: "grid", gridTemplateColumns: "72px 1fr 132px 100px",
            alignItems: "center", gap: 20, padding: "20px 0",
            borderBottom: `1px solid ${C.line}`,
            fontFamily: F.mono, fontSize: 13.5,
            transitionDelay: `${i * 60}ms`,
          }}>
            <span style={{ color: C.faint, letterSpacing: "0.06em" }}>#{a.ref}</span>
            <span className="inc-asiento-desc" style={{ fontFamily: F.body, fontSize: 15.5, color: C.ink }}>{a.concepto}</span>
            <span style={{ color: C.signal, letterSpacing: "0.04em" }}>✓ verificado</span>
            <span style={{ textAlign: "right", fontWeight: 600, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{eur(a.importe)}</span>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 20, paddingTop: 18 }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.faint }}>Pagado esta semana</span>
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {paidThisWeek > 0 ? eur(paidThisWeek) : "€174"}
          </span>
        </div>
      </section>

      {/* ── DOS LADOS ── la idea central del producto, a sangre */}
      <section id="dos-lados" className="inc-lados" style={{ marginTop: "clamp(64px, 9vw, 120px)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div className="inc-lado" data-reveal style={{ background: C.paper2, padding: "clamp(56px, 6vw, 92px) clamp(28px, 4vw, 64px)", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
          <div style={eyebrow}>Para el negocio</div>
          <h2 style={h2}>Sabes qué funciona.</h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.55, color: C.ink2, margin: "20px 0 0", maxWidth: "40ch" }}>
            Cada reserva confirmada queda registrada con su origen, su importe y su hora.
            Pagas por resultado, no por impresiones ni por promesas.
          </p>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column" }}>
            {["QR de un solo uso por reserva", "Verificación presencial con PIN del empleado", "Historial inmutable de conversiones"].map((t, i) => (
              <div key={t} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "13px 0", borderTop: i > 0 ? `1px solid ${C.line}` : "none" }}>
                <span style={{ fontFamily: F.mono, fontSize: 10.5, color: C.signal }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 15 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="inc-lado" data-reveal style={{ background: C.ink, color: C.paper, padding: "clamp(56px, 6vw, 92px) clamp(28px, 4vw, 64px)" }}>
          <div style={{ ...eyebrow, color: "#7C93FF" }}>Para el captador</div>
          <h2 style={{ ...h2, color: C.paper }}>Nadie sabe que fuiste tú.</h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.55, color: "#A8AFB5", margin: "20px 0 0", maxWidth: "40ch" }}>
            El cliente no sabe quién le recomendó. Tu jefe tampoco. El dinero entra
            en tu cuenta personal, y tu identidad nunca sale de Incentis.
          </p>
          <div style={{ marginTop: 40, paddingTop: 30, borderTop: `1px solid ${C.lineInk}` }}>
            <BridgeMark leftLabel="NEGOCIO" rightLabel="CAPTADOR" ink="#6B7278" dim="#6B7278" />
            <p style={{ fontFamily: F.mono, fontSize: 11.5, color: "#6B7278", marginTop: 18, lineHeight: 1.6, letterSpacing: "0.02em" }}>
              Las dos partes solo se tocan a través del código.<br />Nunca intercambian nombres.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROCESO ── es una secuencia real, asi que va numerada */}
      <section id="proceso" className="inc-proceso" style={{ padding: "clamp(64px, 9vw, 120px) 40px", maxWidth: 1400, margin: "0 auto" }}>
        <div data-reveal style={{ maxWidth: "20ch" }}>
          <div style={eyebrow}>Proceso</div>
          <h2 style={h2}>De la campaña al cobro.</h2>
        </div>

        <div style={{ marginTop: 56, borderTop: `2px solid ${C.ink}` }}>
          {[
            {
              n: "01", t: "El negocio publica la campaña",
              d: "Define el incentivo —fijo, porcentaje o bono—, el límite de conversiones y la fecha. Activo en minutos.",
              meta: "€15 por reserva confirmada",
            },
            {
              n: "02", t: "El captador comparte su código",
              d: "Cada persona recibe un QR propio por campaña. Lo enseña a quien quiera, de forma anónima.",
              meta: "incentis.app/scan/xk9q…",
            },
            {
              n: "03", t: "El cliente llega y se verifica",
              d: "Tu equipo escanea el código con su PIN. La plataforma comprueba, acredita el incentivo y avisa al captador.",
              meta: "Acreditado en 48 h",
            },
          ].map((s) => (
            <div key={s.n} className="inc-paso" data-reveal style={{
              display: "grid", gridTemplateColumns: "88px 1fr 280px", gap: 40,
              alignItems: "start", padding: "38px 0", borderBottom: `1px solid ${C.line}`,
            }}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.signal, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.n}</div>
              <div>
                <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: "clamp(20px, 2.2vw, 28px)", letterSpacing: "-0.025em", margin: 0, color: C.ink }}>{s.t}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.55, color: C.ink2, margin: "12px 0 0", maxWidth: "52ch" }}>{s.d}</p>
              </div>
              <div className="inc-paso-meta" style={{ fontFamily: F.mono, fontSize: 12.5, color: C.faint, paddingTop: 6, letterSpacing: "0.02em" }}>{s.meta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LA CUENTA ── */}
      <section id="cuenta" style={{ padding: "0 40px clamp(64px, 9vw, 120px)", maxWidth: 1400, margin: "0 auto" }}>
        <div data-reveal>
          <div style={eyebrow}>La cuenta</div>
          <h2 style={{ ...h2, maxWidth: "18ch" }}>Cuánto te costaría de verdad.</h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: C.ink2, margin: "18px 0 40px", maxWidth: "52ch" }}>
            Mueve los supuestos de tu negocio y mira la liquidación. Solo pagas cuando la conversión ocurre.
          </p>
        </div>
        <div data-reveal><Cuenta /></div>
        <p style={{ fontFamily: F.mono, fontSize: 11, color: C.faint, marginTop: 16, letterSpacing: "0.02em" }}>
          Estimación orientativa · Incentis está en fase de lanzamiento, aún no hay datos históricos.
        </p>
      </section>

      {/* ── ESCALA ── los niveles como una regla graduada, no como tarjetas */}
      <section id="escala" className="inc-escala" style={{ background: C.paper2, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "clamp(64px, 9vw, 110px) 40px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div data-reveal style={{ maxWidth: "22ch" }}>
            <div style={eyebrow}>Escala del captador</div>
            <h2 style={h2}>Cuanto más traes, antes cobras.</h2>
          </div>

          <div className="inc-regla" data-reveal style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `2px solid ${C.ink}` }}>
            {[
              { name: "Bronce",   rango: "0–9",    mult: "1×",    payout: "72 h" },
              { name: "Plata",    rango: "10–29",  mult: "1,25×", payout: "48 h" },
              { name: "Oro",      rango: "30–99",  mult: "1,5×",  payout: "24 h" },
              { name: "Platino",  rango: "100+",   mult: "2×",    payout: "12 h" },
            ].map((t, i) => (
              <div key={t.name} style={{ paddingTop: 22, paddingBottom: 4, paddingRight: 20, borderLeft: i > 0 ? `1px solid ${C.line}` : "none", paddingLeft: i > 0 ? 20 : 0, position: "relative" }}>
                {/* marca de graduacion */}
                <div style={{ position: "absolute", top: -2, left: i > 0 ? 20 : 0, width: 34, height: 3, background: C.signal }} />
                <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink2 }}>{t.name}</div>
                <div style={{ fontFamily: F.mono, fontSize: 11.5, color: C.faint, marginTop: 5 }}>{t.rango} conversiones</div>
                <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: "clamp(38px, 4.4vw, 58px)", letterSpacing: "-0.04em", marginTop: 26, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{t.mult}</div>
                <div style={{ fontFamily: F.mono, fontSize: 11.5, color: C.faint, marginTop: 6 }}>cobro en {t.payout}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CIERRE ── inversion a tinta, tipografia grande, sin caja */}
      <section className="inc-cierre" style={{ background: C.ink, color: C.paper, padding: "clamp(80px, 12vw, 150px) 40px", textAlign: "center" }}>
        <div data-reveal style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...eyebrow, color: "#7C93FF" }}>Programa fundador · plazas limitadas</div>
          <h2 className="inc-cierre-h2" style={{
            fontFamily: F.display, fontWeight: 800,
            fontSize: "clamp(38px, 6.4vw, 92px)", lineHeight: 0.94,
            letterSpacing: "-0.05em", margin: "24px 0 0", color: C.paper, textWrap: "balance",
          }}>
            paga solo cuando traen a alguien<span style={{ color: "#7C93FF" }}>.</span>
          </h2>
          <p style={{ fontSize: 17.5, lineHeight: 1.55, color: "#A8AFB5", margin: "26px auto 0", maxWidth: "48ch" }}>
            Los negocios fundadores entran con onboarding 1:1 y comisión reducida de por vida.
            Sin tarjeta, sin permanencia, activo en diez minutos.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
            <Link href={`/${locale}/register/empresa`} style={{
              fontFamily: F.mono, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.02em",
              color: C.ink, background: C.paper, padding: "17px 30px", textDecoration: "none",
            }}>Solicitar acceso fundador →</Link>
            <Link href={`/${locale}/register/captador`} style={{
              fontFamily: F.mono, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.02em",
              color: C.paper, border: `1px solid ${C.lineInk}`, padding: "17px 30px", textDecoration: "none",
            }}>Quiero captar</Link>
          </div>
        </div>
      </section>

      {/* ── PIE ── */}
      <footer className="inc-pie" style={{
        padding: "30px 40px", maxWidth: 1400, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 18, fontFamily: F.mono, fontSize: 11.5, color: C.faint,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <IncentisLogo size="sm" />
          <span>Captación verificada. Solo pagas por resultado.</span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span>Stripe</span>
          <span>RGPD</span>
          <Link href={`/${locale}/legal`} style={{ color: "inherit", textDecoration: "none" }}>Aviso legal</Link>
          <Link href={`/${locale}/privacidad`} style={{ color: "inherit", textDecoration: "none" }}>Privacidad</Link>
          <span>© 2026 Incentis</span>
        </div>
      </footer>
    </div>
  )
}
