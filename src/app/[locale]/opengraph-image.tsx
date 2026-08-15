import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Incentis — Plataforma de incentivos anónimos"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#16181c",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(43,212,154,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo tile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#0F1F1A",
              border: "2px solid rgba(43,212,154,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-2px",
              position: "relative",
            }}
          >
            <span style={{ color: "#ffffff" }}>iN</span>
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 17,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#D88B2E",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-2.5px",
            }}
          >
            incentis
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.55)",
            margin: 0,
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.4,
            letterSpacing: "-0.3px",
          }}
        >
          Plataforma de incentivos anónimos para captación de clientes
        </p>

        {/* Accent pill */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(43,212,154,0.10)",
            border: "1px solid rgba(43,212,154,0.25)",
            borderRadius: 999,
            padding: "10px 24px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#2bd49a",
            }}
          />
          <span style={{ color: "#2bd49a", fontSize: 16, fontWeight: 600, letterSpacing: "0.04em" }}>
            CAMPAÑA · QR · COBRO AUTOMÁTICO
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
