import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Megaphone } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const statusStyle: Record<string, { label: string; bg: string; color: string; border: string }> = {
  ACTIVE: { label: "Activa",     bg: "rgba(31,107,77,0.08)",   color: "#1F6B4D", border: "rgba(31,107,77,0.20)" },
  PAUSED: { label: "Pausada",    bg: "rgba(216,139,46,0.10)",  color: "#B5710D", border: "rgba(216,139,46,0.25)" },
  ENDED:  { label: "Finalizada", bg: "rgba(15,31,26,0.06)",    color: "#2A3B34", border: "rgba(15,31,26,0.12)" },
}

export default async function AdminCampanasPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/es/login")

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true, type: true } },
      _count: { select: { reservations: true } },
    },
  })

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length
  const cols = "1fr 1fr 100px 80px 100px 110px"

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
          Campañas
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>
          {campaigns.length} campañas · {activeCount} activas
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          <Megaphone className="h-10 w-10 mx-auto mb-4" style={{ color: "#88B5A2" }} />
          <p style={{ color: "#88B5A2" }}>Sin campañas</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          {/* Header */}
          <div
            className="grid gap-4 px-5 py-3"
            style={{ gridTemplateColumns: cols, borderBottom: "1px solid rgba(15,31,26,0.06)" }}
          >
            {["Campaña", "Empresa", "Estado", "Reservas", "Incentivo", "Creada"].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: "#88B5A2" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {campaigns.map((c, i) => {
            const ss = statusStyle[c.status] ?? statusStyle.ENDED
            const incentiveText = [
              c.incentiveTypes.includes("FIXED")      ? `${c.fixedValue ?? c.incentiveValue}€` : null,
              c.incentiveTypes.includes("PERCENTAGE") ? `${c.percentageValue ?? c.incentiveValue}%` : null,
              c.incentiveTypes.includes("BONO")       ? (c.bonusDescription ?? "Bono") : null,
            ].filter(Boolean).join(" + ")

            return (
              <div
                key={c.id}
                className="grid gap-4 px-5 py-3.5 transition-colors hover:bg-[#F8F5EE]"
                style={{
                  gridTemplateColumns: cols,
                  borderTop: i > 0 ? "1px solid rgba(15,31,26,0.05)" : "none",
                  alignItems: "center",
                }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-[13px] truncate" style={{ color: "#0F1F1A" }}>{c.title}</p>
                  {c.endDate && (
                    <p className="text-[11px] mt-0.5" style={{ color: "#88B5A2" }}>
                      Hasta {format(new Date(c.endDate), "dd MMM yyyy", { locale: es })}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[13px] truncate" style={{ color: "#2A3B34" }}>{c.business.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#88B5A2" }}>{c.business.type}</p>
                </div>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium w-fit"
                  style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
                >
                  {ss.label}
                </span>
                <p className="text-[13px] font-semibold" style={{ color: "#1F6B4D" }}>
                  {c._count.reservations}
                </p>
                <p className="text-[12px] font-semibold" style={{ color: "#D88B2E" }}>
                  {incentiveText}
                </p>
                <p className="text-[12px]" style={{ color: "#88B5A2" }}>
                  {format(new Date(c.createdAt), "dd MMM yyyy", { locale: es })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
