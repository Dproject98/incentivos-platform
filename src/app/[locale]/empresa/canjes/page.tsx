import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { Gift } from "lucide-react"
import { CanjeActions } from "./canje-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function EmpresaCanjesPage() {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") redirect("/es/login")

  const locale = await getLocale()

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) redirect(`/${locale}/empresa/dashboard`)

  const redemptions = await prisma.bonoRedemption.findMany({
    where: { campaign: { businessId: business.id } },
    include: {
      campaign: { select: { title: true, bonusDescription: true, bonusMinValue: true } },
      wallet: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = redemptions.filter((r) => r.status === "PENDING").length

  const statusStyle: Record<string, { bg: string; color: string; border: string; label: string }> = {
    PENDING:  { label: "Pendiente",  bg: "rgba(251,191,36,0.10)",  color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
    APPROVED: { label: "Aprobado",   bg: "rgba(43,212,154,0.10)",  color: "#2bd49a", border: "rgba(43,212,154,0.20)" },
    REJECTED: { label: "Rechazado",  bg: "rgba(220,38,38,0.12)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}>
          Canjes de bono
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>
          {redemptions.length} solicitudes{pending > 0 && ` · ${pending} pendientes`}
        </p>
      </div>

      {redemptions.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          <Gift className="h-10 w-10 mx-auto mb-4" style={{ color: "oklch(0.62 0.01 250)" }} />
          <p style={{ color: "oklch(0.62 0.01 250)" }}>Ningún captador ha solicitado canjes aún</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
          {/* Header */}
          <div className="grid gap-4 px-5 py-3" style={{ gridTemplateColumns: "1fr 1fr 90px 110px 180px", borderBottom: "1px solid oklch(0.30 0.02 250)" }}>
            {["Captador", "Bono", "Valor", "Estado", "Acción"].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {redemptions.map((r, i) => {
            const ss = statusStyle[r.status] ?? statusStyle.PENDING
            return (
              <div key={r.id} className="grid gap-4 px-5 py-4 transition-colors hover:bg-white/5"
                style={{ gridTemplateColumns: "1fr 1fr 90px 110px 180px", borderTop: i > 0 ? "1px solid oklch(0.30 0.02 250)" : "none" }}>
                <div>
                  <p className="font-medium text-[14px]" style={{ color: "#ffffff" }}>{r.wallet.user.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "oklch(0.62 0.01 250)" }}>{r.wallet.user.email}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "oklch(0.62 0.01 250)" }}>
                    {format(new Date(r.createdAt), "dd MMM yyyy", { locale: es })}
                  </p>
                </div>
                <div className="self-center">
                  <p className="text-[13px] font-medium" style={{ color: "#ffffff" }}>
                    {r.campaign.bonusDescription ?? r.campaign.title}
                  </p>
                  <p className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>{r.campaign.title}</p>
                </div>
                <p className="self-center font-bold text-[15px]" style={{ color: "#2bd49a" }}>{r.amount}€</p>
                <div className="self-center">
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                    {ss.label}
                  </span>
                  {r.notes && (
                    <p className="text-[11px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>{r.notes}</p>
                  )}
                </div>
                <div className="self-center">
                  <CanjeActions redemptionId={r.id} status={r.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
