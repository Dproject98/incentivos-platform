import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "oklch(0.15 0.012 250)", color: "#ffffff", fontFamily: "sans-serif" }}
    >
      <p
        className="font-bold mb-3"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(72px,15vw,120px)", color: "#2bd49a", lineHeight: 1, letterSpacing: "-0.04em" }}
      >
        404
      </p>
      <h1
        className="font-semibold mb-2"
        style={{ fontSize: "clamp(20px,3vw,28px)", letterSpacing: "-0.03em" }}
      >
        Página no encontrada
      </h1>
      <p className="mb-8 max-w-sm" style={{ color: "oklch(0.62 0.01 250)", fontSize: "15px" }}>
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/es"
        className="px-6 py-3 rounded-full font-semibold text-[15px] transition-opacity hover:opacity-80"
        style={{ background: "#2bd49a", color: "#0c0c0a" }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}
