"use client"

import { useState } from "react"

const faqs = [
  {
    q: "¿Cómo se verifica una conversión?",
    a: "El captador genera un QR único por cada reserva. El personal del negocio escanea ese QR cuando el cliente llega. La plataforma confirma la presencia y acredita el incentivo automáticamente. Todo queda registrado de forma inmutable.",
  },
  {
    q: "¿Qué datos del captador se comparten con la empresa?",
    a: "Ninguno que permita identificar a la persona ni a su empleador. La empresa ve un alias (Captador #A7) y las métricas de conversión. El captador mantiene anonimato total frente al negocio.",
  },
  {
    q: "¿Cuándo cobra el captador?",
    a: "El incentivo se acredita al wallet del captador en el momento en que el staff escanea el QR. El pago bancario llega en 24–72 h según el nivel (Bronze: 72h, Silver: 48h, Gold: 24h, Platinum: 12h).",
  },
  {
    q: "¿Es legal el anonimato del captador?",
    a: "Sí. Incentis actúa como intermediario de pago. El captador pasa KYC completo (verificación de identidad) antes del primer cobro. La actividad queda registrada y es declarable. No es anonimato fiscal, sino anonimato frente al negocio recomendado.",
  },
  {
    q: "¿Se integra con mi CRM?",
    a: "La integración vía API está en roadmap para Q3 2025. Actualmente puedes exportar datos de reservas y conversiones en CSV desde el dashboard empresa.",
  },
  {
    q: "¿Qué pasa si hay una devolución o no-show?",
    a: "Si el cliente reserva pero no aparece, el staff puede marcar la reserva como 'No show'. En ese caso el incentivo no se acredita. Si ya se acreditó antes de la marcación, el importe se retiene en el siguiente ciclo.",
  },
  {
    q: "¿Hay un mínimo de campaña?",
    a: "No hay mínimo de presupuesto ni duración. Puedes crear una campaña con un incentivo de €5 por conversión y desactivarla cuando quieras. Solo pagas cuando hay resultado.",
  },
  {
    q: "¿En qué países opera Incentis?",
    a: "Actualmente disponible en España. Expansión a Portugal, México y Colombia prevista para 2025. Los pagos se procesan en EUR a través de Stripe Connect.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-24 px-6 md:px-12" style={{ background: "#F2EBDC" }}>
      <div className="max-w-[720px] mx-auto">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-4 text-center" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          PREGUNTAS FRECUENTES
        </p>
        <h2
          className="font-display font-semibold text-center mb-12"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(26px,3.5vw,40px)", letterSpacing: "-0.03em" }}
        >
          Todo lo que necesitas saber.
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(15,31,26,0.10)", background: open === i ? "#E8DFCD" : "#F2EBDC" }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-[15px] font-medium pr-4" style={{ color: "#0F1F1A" }}>{faq.q}</span>
                <span
                  className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-transform"
                  style={{
                    background: "rgba(15,31,26,0.08)",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                    <path d="M5 1v8M1 5h8" stroke="#0F1F1A" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-[15px] leading-relaxed" style={{ color: "#2A3B34" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
