import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const roleStyle: Record<string, { label: string; bg: string; color: string; border: string }> = {
  ADMIN:    { label: "Admin",     bg: "rgba(220,38,38,0.08)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
  EMPRESA:  { label: "Empresa",   bg: "rgba(31,107,77,0.08)",   color: "#1F6B4D", border: "rgba(31,107,77,0.20)" },
  CAPTADOR: { label: "Captador",  bg: "rgba(216,139,46,0.10)",  color: "#B5710D", border: "rgba(216,139,46,0.25)" },
  STAFF:    { label: "Staff",     bg: "rgba(15,31,26,0.06)",    color: "#2A3B34", border: "rgba(15,31,26,0.15)" },
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
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-1" style={{ color: "#88B5A2" }}>
          Administración
        </p>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          Usuarios
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>{users.length} usuarios registrados</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          <Users className="h-10 w-10 mx-auto mb-4" style={{ color: "#88B5A2" }} />
          <p style={{ color: "#88B5A2" }}>Sin usuarios</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          {/* Header */}
          <div
            className="grid gap-4 px-5 py-3"
            style={{ gridTemplateColumns: cols, borderBottom: "1px solid rgba(15,31,26,0.06)" }}
          >
            {["Nombre", "Email", "Rol", "Reservas", "Saldo", "Registro"].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: "#88B5A2" }}>
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
                className="grid gap-4 px-5 py-3.5 transition-colors hover:bg-[#F8F5EE]"
                style={{
                  gridTemplateColumns: cols,
                  borderTop: i > 0 ? "1px solid rgba(15,31,26,0.05)" : "none",
                  alignItems: "center",
                }}
              >
                <p className="font-medium text-[13px] truncate" style={{ color: "#0F1F1A" }}>{u.name}</p>
                <p className="text-[12px] truncate" style={{ color: "#88B5A2" }}>{u.email}</p>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium w-fit"
                  style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                >
                  {rs.label}
                </span>
                <p className="text-[13px] font-semibold" style={{ color: "#1F6B4D" }}>
                  {u._count.reservations}
                </p>
                <p className="text-[13px] font-semibold" style={{ color: u.wallet ? "#D88B2E" : "#88B5A2" }}>
                  {u.wallet ? `${u.wallet.balance.toFixed(2)} €` : "—"}
                </p>
                <p className="text-[12px]" style={{ color: "#88B5A2" }}>
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
