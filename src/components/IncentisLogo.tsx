/**
 * IncentisLogo — tile iN + wordmark "incentis" con el punto amber en la "i"
 * Props:
 *   size  → "sm" (nav) | "md" (auth pages) — default "sm"
 *   light → true si el fondo es oscuro (tile blanco)
 */

interface IncentisLogoProps {
  size?: "sm" | "md"
  light?: boolean
}

export function IncentisLogo({ size = "sm", light = false }: IncentisLogoProps) {
  const tileSize  = size === "md" ? 36 : 28
  const textSize  = size === "md" ? "19px" : "17px"
  const tileColor = light ? "#fff" : "#0F1F1A"
  const letterColor = light ? "#0F1F1A" : "#fff"

  return (
    <span className="flex items-center gap-2.5">
      {/* ── Icon tile ─────────────────────────────────────────── */}
      <svg
        width={tileSize}
        height={tileSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Tile background */}
        <rect width="36" height="36" rx="8" fill={tileColor} />

        {/* Gold dot — puntito de la "i" */}
        <circle cx="12" cy="8.5" r="2.6" fill="#D88B2E" />

        {/* i — stem */}
        <rect x="10" y="13" width="4" height="16" rx="2" fill={letterColor} />

        {/* N — letterform (tres trazos: barra izq, diagonal, barra dcha) */}
        <path
          d="M18 13V29M18 13L28 29M28 13V29"
          stroke={letterColor}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* ── Wordmark ──────────────────────────────────────────── */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: textSize,
          letterSpacing: "-0.04em",
          color: "#0F1F1A",
          lineHeight: 1,
        }}
      >
        incent
        {/* "i" con el punto amber (cubre el punto nativo del glifo) */}
        <span style={{ position: "relative", display: "inline-block" }}>
          <span style={{ color: "#0F1F1A" }}>i</span>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "0.06em",
              left: "50%",
              transform: "translateX(-50%)",
              width: "0.22em",
              height: "0.22em",
              borderRadius: "50%",
              background: "#D88B2E",
              pointerEvents: "none",
            }}
          />
        </span>
        s
      </span>
    </span>
  )
}
