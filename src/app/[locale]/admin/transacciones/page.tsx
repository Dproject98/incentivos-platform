import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ArrowLeftRight, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function AdminTransaccionesPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/es/login")

  const [transactions, totalCreditAgg, totalDebitAgg] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        wallet: { include: { user: { select: { name: true, email: true } } } },
        reservation: { include: { campaign: { select: { title: true } } } },
      },
    }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "CREDIT" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "DEBIT" } }),
  ])

  const totalCredit = totalCreditAgg._sum.amount ?? 0
  const totalDebit  = totalDebitAgg._sum.amount  ?? 0
  const cols = "1fr 1fr 100px 110px 140px"

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] mb-1" style={{ color: "#88B5A2" }}>
          Administración
        </p>
        <h1
          className="font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}
        >
          Transacciones
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "#88B5A2" }}>
          Últimas 50 transacciones
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          <p className="text-[10px] uppercase tracking-[0.1em] font-mono mb-2" style={{ color: "#88B5A2" }}>
            Total acreditado (CREDIT)
          </p>
          <p className="font-semibold text-[28px]" style={{ fontFamily: "var(--font-display)", color: "#1F6B4D", letterSpacing: "-0.03em" }}>
            {totalCredit.toFixed(2)} €
          </p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          <p className="text-[10px] uppercase tracking-[0.1em] font-mono mb-2" style={{ color: "#88B5A2" }}>
            Total retirado (DEBIT)
          </p>
          <p className="font-semibold text-[28px]" style={{ fontFamily: "var(--font-display)", color: "#dc2626", letterSpacing: "-0.03em" }}>
            {totalDebit.toFixed(2)} €
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          <ArrowLeftRight className="h-10 w-10 mx-auto mb-4" style={{ color: "#88B5A2" }} />
          <p style={{ color: "#88B5A2" }}>Sin transacciones</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
          {/* Header */}
          <div
            className="grid gap-4 px-5 py-3"
            style={{ gridTemplateColumns: cols, borderBottom: "1px solid rgba(15,31,26,0.06)" }}
          >
            {["Captador", "Descripción", "Tipo", "Importe", "Fecha"].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-[0.1em] font-mono" style={{ color: "#88B5A2" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {transactions.map((tx, i) => {
            const isCredit = tx.type === "CREDIT"
            return (
              <div
                key={tx.id}
                className="grid gap-4 px-5 py-3.5 transition-colors hover:bg-[#F8F5EE]"
                style={{
                  gridTemplateColumns: cols,
                  borderTop: i > 0 ? "1px solid rgba(15,31,26,0.05)" : "none",
                  alignItems: "center",
                }}
              >
                <div>
                  <p className="font-medium text-[13px] truncate" style={{ color: "#0F1F1A" }}>{tx.wallet.user.name}</p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: "#88B5A2" }}>{tx.wallet.user.email}</p>
                </div>
                <div>
                  <p className="text-[12px] truncate" style={{ color: "#2A3B34" }}>{tx.description}</p>
                  {tx.reservation && (
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: "#88B5A2" }}>
                      {tx.reservation.campaign.title}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isCredit ? "rgba(31,107,77,0.10)" : "rgba(220,38,38,0.08)",
                      border: isCredit ? "1px solid rgba(31,107,77,0.20)" : "1px solid rgba(220,38,38,0.15)",
                    }}
                  >
                    {isCredit
                      ? <ArrowDownRight className="h-3 w-3" style={{ color: "#1F6B4D" }} />
                      : <ArrowUpRight className="h-3 w-3" style={{ color: "#dc2626" }} />}
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: isCredit ? "#1F6B4D" : "#dc2626" }}>
                    {tx.type}
                  </span>
                </div>
                <p
                  className="font-semibold text-[13px]"
                  style={{ color: isCredit ? "#1F6B4D" : "#dc2626" }}
                >
                  {isCredit ? "+" : "-"}{tx.amount.toFixed(2)} €
                </p>
                <p className="text-[12px]" style={{ color: "#88B5A2" }}>
                  {format(new Date(tx.createdAt), "dd MMM yyyy HH:mm", { locale: es })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
