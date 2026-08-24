import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "#16171A", color: "#F2F1EF", fontFamily: "sans-serif" }}
    >
      <p
        className="font-bold mb-3"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(72px,15vw,120px)", color: "#E8735A", lineHeight: 1, letterSpacing: "-0.04em" }}
      >
        404
      </p>
      <h1
        className="font-semibold mb-2"
        style={{ fontSize: "clamp(20px,3vw,28px)", letterSpacing: "-0.03em" }}
      >
        Página no encontrada
      </h1>
      <p className="mb-8 max-w-sm" style={{ color: "#93979E", fontSize: "15px" }}>
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/es"
        className="px-6 py-3 rounded-full font-semibold text-[15px] transition-opacity hover:opacity-80"
        style={{ background: "#E8735A", color: "#16171A" }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}
