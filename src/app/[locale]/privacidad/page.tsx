import type { Metadata } from "next"
import Link from "next/link"
import { IncentisLogo } from "@/components/IncentisLogo"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Información sobre el tratamiento de datos personales en la plataforma Incentis.",
}

const BG   = "oklch(0.15 0.012 250)"
const CARD = "oklch(0.19 0.015 250)"
const BDR  = "oklch(0.30 0.02 250)"
const MUT  = "oklch(0.62 0.01 250)"
const ACC  = "#2bd49a"

export default async function PrivacidadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BDR}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={`/${locale}`} style={{ textDecoration: "none" }}>
          <IncentisLogo size="sm" light />
        </Link>
        <Link href={`/${locale}`} style={{ fontSize: 13, color: MUT, textDecoration: "none" }}>← Volver al inicio</Link>
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "64px 32px 96px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", color: ACC, textTransform: "uppercase", margin: "0 0 12px" }}>Documento legal</p>
          <h1 style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 48, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 12px", lineHeight: 1 }}>Política de Privacidad</h1>
          <p style={{ fontSize: 14, color: MUT, margin: 0 }}>Última actualización: junio de 2026</p>
        </div>

        <Section title="1. Responsable del tratamiento">
          <p>En cumplimiento del Reglamento (UE) 2016/679 General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), le informamos de que el responsable del tratamiento de sus datos personales es:</p>
          <InfoTable rows={[
            ["Denominación social", "[NOMBRE_EMPRESA, S.L.]"],
            ["CIF", "[B-XXXXXXXX]"],
            ["Domicilio social", "[Dirección completa], España"],
            ["Correo electrónico", "privacidad@incentis.app"],
            ["Web", "https://incentis.app"],
          ]} />
        </Section>

        <Section title="2. Datos que recogemos">
          <p>Tratamos las siguientes categorías de datos según el tipo de usuario:</p>
          <SubTitle>Empresas (negocios que crean campañas)</SubTitle>
          <ul>
            <li>Nombre, apellidos y correo electrónico del representante</li>
            <li>Nombre y datos del negocio</li>
            <li>Datos de facturación para procesamiento de pagos (gestionados por Stripe)</li>
          </ul>
          <SubTitle>Captadores</SubTitle>
          <ul>
            <li>Nombre, apellidos, correo electrónico y teléfono</li>
            <li>Datos del wallet (saldo acumulado, transacciones)</li>
            <li>Historial de reservas referidas</li>
          </ul>
          <SubTitle>Clientes finales (clientes de los negocios)</SubTitle>
          <ul>
            <li>Nombre y datos de reserva facilitados por el captador</li>
            <li>No creamos cuenta ni almacenamos datos de contacto del cliente final</li>
          </ul>
          <SubTitle>Staff (empleados de los negocios)</SubTitle>
          <ul>
            <li>Nombre y PIN de verificación (almacenado cifrado)</li>
          </ul>
        </Section>

        <Section title="3. Finalidad y base legal del tratamiento">
          <InfoTable rows={[
            ["Gestión de la cuenta de usuario", "Ejecución de contrato (art. 6.1.b RGPD)"],
            ["Procesamiento de pagos e incentivos", "Ejecución de contrato (art. 6.1.b RGPD)"],
            ["Envío de notificaciones transaccionales", "Ejecución de contrato (art. 6.1.b RGPD)"],
            ["Comunicaciones comerciales", "Consentimiento (art. 6.1.a RGPD)"],
            ["Cumplimiento de obligaciones legales", "Obligación legal (art. 6.1.c RGPD)"],
            ["Prevención del fraude", "Interés legítimo (art. 6.1.f RGPD)"],
          ]} />
        </Section>

        <Section title="4. Destinatarios de los datos">
          <p>Sus datos podrán ser comunicados a los siguientes proveedores de servicios, en calidad de encargados del tratamiento:</p>
          <ul>
            <li><strong>Stripe, Inc.</strong> — procesamiento de pagos (EE.UU., con cláusulas contractuales tipo)</li>
            <li><strong>Supabase</strong> — base de datos alojada en la UE (Frankfurt, eu-central-1)</li>
            <li><strong>Vercel, Inc.</strong> — infraestructura de alojamiento</li>
            <li><strong>Resend</strong> — envío de correos electrónicos transaccionales</li>
            <li><strong>Twilio</strong> — envío de SMS de verificación</li>
          </ul>
          <p>No vendemos ni cedemos sus datos a terceros con fines publicitarios.</p>
        </Section>

        <Section title="5. Conservación de los datos">
          <p>Conservaremos sus datos mientras mantenga una cuenta activa en la plataforma. Tras la baja, los datos se eliminarán en un plazo máximo de 30 días, salvo obligación legal de conservación (p. ej. datos fiscales: 5 años; datos de transacciones: 6 años según la Ley General Tributaria).</p>
        </Section>

        <Section title="6. Sus derechos">
          <p>Puede ejercer en cualquier momento los siguientes derechos, dirigiéndose a <a href="mailto:privacidad@incentis.app" style={{ color: ACC }}>privacidad@incentis.app</a>:</p>
          <ul>
            <li><strong>Acceso</strong> — conocer qué datos tratamos sobre usted</li>
            <li><strong>Rectificación</strong> — corregir datos inexactos o incompletos</li>
            <li><strong>Supresión</strong> — solicitar la eliminación de sus datos ("derecho al olvido")</li>
            <li><strong>Oposición</strong> — oponerse al tratamiento en determinadas circunstancias</li>
            <li><strong>Limitación</strong> — solicitar la restricción del tratamiento</li>
            <li><strong>Portabilidad</strong> — recibir sus datos en formato estructurado y legible por máquina</li>
          </ul>
          <p>Tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es) si considera que sus derechos no han sido atendidos.</p>
        </Section>

        <Section title="7. Cookies">
          <p>Utilizamos únicamente cookies esenciales para el funcionamiento de la plataforma:</p>
          <InfoTable rows={[
            ["next-auth.session-token", "Sesión autenticada de usuario", "Sesión / 30 días"],
            ["next-auth.csrf-token", "Protección CSRF", "Sesión"],
            ["incentis_cookie_consent", "Preferencia de consentimiento de cookies", "1 año"],
          ]} headers={["Cookie", "Finalidad", "Duración"]} />
          <p>No utilizamos cookies de analítica, publicidad ni rastreo de terceros.</p>
        </Section>

        <Section title="8. Seguridad">
          <p>Aplicamos medidas técnicas y organizativas apropiadas para proteger sus datos: conexiones cifradas (TLS), contraseñas almacenadas con hash bcrypt, tokens de sesión firmados con clave secreta, y aislamiento de datos por organización.</p>
        </Section>

        <Section title="9. Cambios en esta política">
          <p>Podemos actualizar esta política de privacidad para reflejar cambios en nuestras prácticas o en la normativa aplicable. Le notificaremos los cambios sustanciales por correo electrónico o mediante aviso en la plataforma.</p>
        </Section>
      </main>

      <footer style={{ borderTop: `1px solid ${BDR}`, padding: "24px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <Link href={`/${locale}`} style={{ fontSize: 13, color: MUT, textDecoration: "none" }}>Inicio</Link>
          <Link href={`/${locale}/legal`} style={{ fontSize: 13, color: MUT, textDecoration: "none" }}>Aviso legal</Link>
          <Link href={`/${locale}/privacidad`} style={{ fontSize: 13, color: ACC, textDecoration: "none" }}>Privacidad</Link>
        </div>
        <p style={{ fontSize: 12, color: "oklch(0.45 0.01 250)", marginTop: 12 }}>© 2026 Incentis. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40, paddingBottom: 40, borderBottom: `1px solid ${BDR}` }}>
      <h2 style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 22, color: "#ffffff", margin: "0 0 16px", letterSpacing: "-0.02em" }}>{title}</h2>
      <div style={{ fontSize: 15, color: "oklch(0.72 0.01 250)", lineHeight: 1.7 }}>{children}</div>
    </section>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontWeight: 600, color: "#ffffff", margin: "16px 0 6px", fontSize: 14 }}>{children}</p>
}

function InfoTable({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  return (
    <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", border: `1px solid ${BDR}` }}>
      {headers && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`, background: CARD, borderBottom: `1px solid ${BDR}` }}>
          {headers.map((h) => (
            <div key={h} style={{ padding: "10px 14px", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", color: MUT, textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
      )}
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${row.length}, 1fr)`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", borderBottom: i < rows.length - 1 ? `1px solid ${BDR}` : "none" }}>
          {row.map((cell, j) => (
            <div key={j} style={{ padding: "10px 14px", fontSize: 13, color: j === 0 ? "#ffffff" : MUT }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  )
}
