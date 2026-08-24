import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Megaphone } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const statusStyle: Record<string, { label: string; bg: string; color: string; border: string }> = {
  ACTIVE: { label: "Activa",     bg: "rgba(43,212,154,0.10)",  color: "#E8735A", border: "rgba(43,212,154,0.20)" },
  PAUSED: { label: "Pausada",    bg: "rgba(251,191,36,0.10)",  color: "#D9B36C", border: "rgba(251,191,36,0.25)" },
  ENDED:  { label: "Finalizada", bg: "#34373C",   color: "#AEB2B8", border: "#34373C" },
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
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-1" style={{ color: "#93979E" }}>
          Administración
        </p>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#F2F1EF", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          Campañas
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#93979E" }}>
          {campaigns.length} campañas · {activeCount} activas
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
          <Megaphone className="h-10 w-10 mx-auto mb-4" style={{ color: "#93979E" }} />
          <p style={{ color: "#93979E" }}>Sin campañas</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
          {/* Header */}
          <div
            className="grid gap-4 px-5 py-3"
            style={{ gridTemplateColumns: cols, borderBottom: "1px solid #34373C" }}
          >
            {["Campaña", "Empresa", "Estado", "Reservas", "Incentivo", "Creada"].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: "#93979E" }}>
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
                className="grid gap-4 px-5 py-3.5 transition-colors hover:bg-white/5"
                style={{
                  gridTemplateColumns: cols,
                  borderTop: i > 0 ? "1px solid #34373C" : "none",
                  alignItems: "center",
                }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-[13px] truncate" style={{ color: "#F2F1EF" }}>{c.title}</p>
                  {c.endDate && (
                    <p className="text-[11px] mt-0.5" style={{ color: "#93979E" }}>
                      Hasta {format(new Date(c.endDate), "dd MMM yyyy", { locale: es })}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[13px] truncate" style={{ color: "#AEB2B8" }}>{c.business.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#93979E" }}>{c.business.type}</p>
                </div>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium w-fit"
                  style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
                >
                  {ss.label}
                </span>
                <p className="text-[13px] font-semibold" style={{ color: "#E8735A" }}>
                  {c._count.reservations}
                </p>
                <p className="text-[12px] font-semibold" style={{ color: "#E8735A" }}>
                  {incentiveText}
                </p>
                <p className="text-[12px]" style={{ color: "#93979E" }}>
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
