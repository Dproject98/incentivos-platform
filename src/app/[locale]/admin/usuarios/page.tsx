import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const roleStyle: Record<string, { label: string; bg: string; color: string; border: string }> = {
  ADMIN:    { label: "Admin",     bg: "rgba(220,38,38,0.12)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
  EMPRESA:  { label: "Empresa",   bg: "rgba(43,212,154,0.10)",  color: "#2bd49a", border: "rgba(43,212,154,0.20)" },
  CAPTADOR: { label: "Captador",  bg: "rgba(251,191,36,0.10)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  STAFF:    { label: "Staff",     bg: "oklch(0.30 0.02 250)",   color: "oklch(0.72 0.01 250)", border: "oklch(0.30 0.02 250)" },
}

export default async function AdminUsuariosPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/es/login")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      wallet: { select: { balance: true } },
      _count: { select: { reservations: true } },
    },
  })

  const cols = "1fr 1fr 100px 80px 120px 110px"

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-1" style={{ color: "oklch(0.62 0.01 250)" }}>
          Administración
        </p>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          Usuarios
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>{users.length} usuarios registrados</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          <Users className="h-10 w-10 mx-auto mb-4" style={{ color: "oklch(0.62 0.01 250)" }} />
          <p style={{ color: "oklch(0.62 0.01 250)" }}>Sin usuarios</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          {/* Header */}
          <div
            className="grid gap-4 px-5 py-3"
            style={{ gridTemplateColumns: cols, borderBottom: "1px solid oklch(0.30 0.02 250)" }}
          >
            {["Nombre", "Email", "Rol", "Reservas", "Saldo", "Registro"].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: "oklch(0.62 0.01 250)" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {users.map((u, i) => {
            const rs = roleStyle[u.role] ?? roleStyle.STAFF
            return (
              <div
                key={u.id}
                className="grid gap-4 px-5 py-3.5 transition-colors hover:bg-white/5"
                style={{
                  gridTemplateColumns: cols,
                  borderTop: i > 0 ? "1px solid oklch(0.30 0.02 250)" : "none",
                  alignItems: "center",
                }}
              >
                <p className="font-medium text-[13px] truncate" style={{ color: "#ffffff" }}>{u.name}</p>
                <p className="text-[12px] truncate" style={{ color: "oklch(0.62 0.01 250)" }}>{u.email}</p>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium w-fit"
                  style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                >
                  {rs.label}
                </span>
                <p className="text-[13px] font-semibold" style={{ color: "#2bd49a" }}>
                  {u._count.reservations}
                </p>
                <p className="text-[13px] font-semibold" style={{ color: u.wallet ? "#2bd49a" : "oklch(0.62 0.01 250)" }}>
                  {u.wallet ? `${u.wallet.balance.toFixed(2)} €` : "—"}
                </p>
                <p className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>
                  {format(new Date(u.createdAt), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
