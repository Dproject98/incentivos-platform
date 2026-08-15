import type { Metadata } from "next"
import Link from "next/link"
import { IncentisLogo } from "@/components/IncentisLogo"

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "Aviso legal y condiciones de uso de la plataforma Incentis.",
}

const BG   = "oklch(0.15 0.012 250)"
const CARD = "oklch(0.19 0.015 250)"
const BDR  = "oklch(0.30 0.02 250)"
const MUT  = "oklch(0.62 0.01 250)"
const ACC  = "#2bd49a"

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
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
          <h1 style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 48, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 12px", lineHeight: 1 }}>Aviso Legal</h1>
          <p style={{ fontSize: 14, color: MUT, margin: 0 }}>Última actualización: junio de 2026</p>
        </div>

        <Section title="1. Datos identificativos">
          <p>En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), le informamos que el titular de este sitio web es:</p>
          <InfoTable rows={[
            ["Denominación social", "[NOMBRE_EMPRESA, S.L.]"],
            ["CIF", "[B-XXXXXXXX]"],
            ["Domicilio social", "[Dirección completa], España"],
            ["Registro Mercantil", "[Inscrita en el RM de [ciudad], tomo X, folio Y, hoja Z]"],
            ["Correo electrónico", "hola@incentis.app"],
            ["Web", "https://incentis.app"],
          ]} />
        </Section>

        <Section title="2. Objeto y ámbito de aplicación">
          <p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>https://incentis.app</strong> y de la plataforma de incentivos Incentis (en adelante, "la Plataforma"), titularidad de la empresa indicada en el apartado anterior.</p>
          <p>El acceso y uso de la Plataforma implica la aceptación plena y sin reservas de las presentes condiciones. Si no está de acuerdo con alguna de ellas, le rogamos que no utilice la Plataforma.</p>
        </Section>

        <Section title="3. Descripción del servicio">
          <p>Incentis es una plataforma SaaS que permite a negocios (restaurantes, hoteles, experiencias) crear campañas de incentivos anónimos mediante las cuales clientes satisfechos pueden referir a nuevos clientes a cambio de una recompensa económica. La plataforma gestiona:</p>
          <ul>
            <li>Creación y gestión de campañas de incentivos</li>
            <li>Verificación de reservas mediante códigos QR</li>
            <li>Wallet digital y pago de comisiones a captadores</li>
            <li>Panel de administración para negocios y captadores</li>
          </ul>
        </Section>

        <Section title="4. Condiciones de acceso y uso">
          <p>El usuario se compromete a hacer un uso adecuado y lícito de la Plataforma, absteniéndose de:</p>
          <ul>
            <li>Utilizar la Plataforma con fines fraudulentos o ilícitos</li>
            <li>Crear reservas falsas o manipular el sistema de incentivos</li>
            <li>Intentar acceder a datos de otros usuarios</li>
            <li>Introducir, almacenar o difundir mediante la Plataforma cualquier contenido que infrinja la legislación vigente</li>
            <li>Realizar ingeniería inversa, descompilar o desensamblar cualquier parte de la Plataforma</li>
          </ul>
          <p>El incumplimiento de estas condiciones podrá suponer la suspensión o cancelación de la cuenta sin previo aviso.</p>
        </Section>

        <Section title="5. Propiedad intelectual e industrial">
          <p>Todos los contenidos de la Plataforma —incluyendo, sin carácter limitativo, textos, fotografías, gráficos, imágenes, iconos, tecnología, software, logotipos y diseños— son propiedad de Incentis o de terceros que han autorizado su uso, y están protegidos por las leyes de propiedad intelectual e industrial.</p>
          <p>Queda prohibida la reproducción total o parcial, distribución, transformación o cualquier otra forma de explotación de los contenidos de la Plataforma sin autorización previa y por escrito del titular.</p>
        </Section>

        <Section title="6. Exclusión de responsabilidad">
          <p>Incentis no será responsable de:</p>
          <ul>
            <li>Los daños derivados de interrupciones, errores o fallos en el acceso a la Plataforma por causas ajenas a su control</li>
            <li>La veracidad de los datos facilitados por los usuarios en el momento del registro</li>
            <li>El incumplimiento por parte de los negocios de sus obligaciones con los captadores y clientes</li>
            <li>Los contenidos de sitios web de terceros enlazados desde la Plataforma</li>
          </ul>
        </Section>

        <Section title="7. Legislación aplicable y jurisdicción">
          <p>Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia derivada del uso de la Plataforma, las partes se someten, con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales del domicilio social del titular.</p>
          <p>Para conflictos de consumo, puede acceder a la plataforma de resolución de litigios en línea de la UE: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: ACC }}>ec.europa.eu/consumers/odr</a>.</p>
        </Section>

        <Section title="8. Modificaciones">
          <p>Incentis se reserva el derecho de modificar el presente Aviso Legal en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en la Plataforma. El uso continuado de la Plataforma tras la publicación de los cambios implica su aceptación.</p>
        </Section>
      </main>

      <footer style={{ borderTop: `1px solid ${BDR}`, padding: "24px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <Link href={`/${locale}`} style={{ fontSize: 13, color: MUT, textDecoration: "none" }}>Inicio</Link>
          <Link href={`/${locale}/legal`} style={{ fontSize: 13, color: ACC, textDecoration: "none" }}>Aviso legal</Link>
          <Link href={`/${locale}/privacidad`} style={{ fontSize: 13, color: MUT, textDecoration: "none" }}>Privacidad</Link>
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

function InfoTable({ rows }: { rows: string[][] }) {
  return (
    <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", border: `1px solid ${BDR}` }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", borderBottom: i < rows.length - 1 ? `1px solid ${BDR}` : "none" }}>
          <div style={{ padding: "10px 14px", fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{row[0]}</div>
          <div style={{ padding: "10px 14px", fontSize: 13, color: MUT }}>{row[1]}</div>
        </div>
      ))}
    </div>
  )
}
