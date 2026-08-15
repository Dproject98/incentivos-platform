"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Wallet, ArrowDownRight, ArrowUpRight, Link2, CheckCircle, CreditCard, Gift, ChevronRight, Clock, X } from "lucide-react"

interface Transaction {
  id: string; amount: number; type: "CREDIT" | "DEBIT"; description: string; createdAt: string
}
interface AvailableBono {
  id: string; title: string; bonusDescription: string | null; bonusMinValue: number | null
  business: { name: string; type: string }
}
interface PendingRedemption {
  id: string; amount: number; status: string; createdAt: string
  campaign: { title: string; bonusDescription: string | null; business: { name: string } }
}
interface WalletData {
  balance: number; transactions: Transaction[]; stripeConnected: boolean
  availableBonos: AvailableBono[]; pendingRedemptions: PendingRedemption[]
}

const inputStyle = { background: "oklch(0.22 0.015 250)", border: "1px solid oklch(0.30 0.02 250)", color: "#ffffff" }

export default function WalletPage() {
  const t = useTranslations("captador.wallet")
  const locale = useLocale()

  const [data, setData] = useState<WalletData | null>(null)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<"stripe" | "bono">("stripe")
  const [selectedBono, setSelectedBono] = useState<AvailableBono | null>(null)
  const [loading, setLoading] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)

  const reload = () =>
    fetch("/api/wallet").then((r) => {
      if (!r.ok) return null
      return r.json()
    }).then((d) => { if (d) setData(d) })
  useEffect(() => { reload() }, [])

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) return
    setLoading(true)
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountNum, method: "stripe" }),
    })
    if (!res.ok) {
      const err = await res.json()
      if (err.error === "insufficient_balance") toast.error(t("insufficient_balance"))
      else if (err.error === "no_stripe_account") toast.error("Conecta primero tu cuenta bancaria")
      else toast.error("Error al procesar el retiro")
      setLoading(false); return
    }
    toast.success("Retiro solicitado con éxito")
    setAmount(""); await reload(); setLoading(false)
  }

  const handleRedeemBono = async () => {
    if (!selectedBono) return
    setLoading(true)
    const res = await fetch("/api/wallet/redeem-bono", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: selectedBono.id }),
    })
    if (!res.ok) {
      const err = await res.json()
      if (err.error === "insufficient_balance") toast.error(`Necesitas al menos ${err.required}€`)
      else if (err.error === "already_pending") toast.error("Ya tienes una solicitud pendiente para este bono")
      else toast.error("Error al solicitar el canje")
      setLoading(false); return
    }
    toast.success("Solicitud de canje enviada. La empresa la gestionará en breve.")
    setSelectedBono(null); await reload(); setLoading(false)
  }

  const handleStripeConnect = async () => {
    setConnectingStripe(true)
    const res = await fetch("/api/wallet/stripe-connect", { method: "POST" })
    const { url } = await res.json()
    if (url) window.location.href = url
    setConnectingStripe(false)
  }

  if (!data) return (
    <div className="flex items-center justify-center h-48">
      <div className="h-8 w-8 rounded-full border-2 animate-spin"
        style={{ borderColor: "oklch(0.80 0.17 162 / 0.20)", borderTopColor: "#2bd49a" }} />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#ffffff", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}>
          {t("title")}
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "oklch(0.62 0.01 250)" }}>Tu saldo e historial de incentivos</p>
      </div>

      {/* Balance */}
      <div className="rounded-2xl p-6" style={{ background: "oklch(0.80 0.17 162 / 0.15)", border: "1px solid oklch(0.80 0.17 162 / 0.20)" }}>
        <div className="flex items-center gap-2 mb-3 text-[13px]" style={{ color: "oklch(0.72 0.01 250)" }}>
          <Wallet className="h-4 w-4" />{t("balance")}
        </div>
        <div className="text-[48px] font-bold leading-none" style={{ color: "#ffffff" }}>
          {data.balance.toFixed(2)} <span style={{ color: "#2bd49a" }}>€</span>
        </div>
        <p className="text-[13px] mt-2" style={{ color: "oklch(0.62 0.01 250)" }}>Disponible</p>
      </div>

      {/* Method selector */}
      <div className="rounded-2xl p-5" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
        <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4" style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)" }}>
          {t("withdraw")}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { key: "stripe" as const, icon: CreditCard, label: t("stripe_transfer"), sub: "Transferencia bancaria" },
            { key: "bono"   as const, icon: Gift,       label: t("bono"),            sub: "Canjear por experiencia" },
          ].map(({ key, icon: Icon, label, sub }) => (
            <button key={key} onClick={() => { setMethod(key); setSelectedBono(null) }}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                background: method === key ? (key === "stripe" ? "rgba(43,212,154,0.10)" : "rgba(251,191,36,0.10)") : "oklch(0.22 0.015 250)",
                border: method === key ? (key === "stripe" ? "1px solid rgba(43,212,154,0.25)" : "1px solid rgba(251,191,36,0.25)") : "1px solid oklch(0.30 0.02 250)",
                color: method === key ? (key === "stripe" ? "#2bd49a" : "#fbbf24") : "oklch(0.72 0.01 250)",
              }}>
              <Icon className="h-4 w-4 mb-1.5" style={{ color: method === key ? (key === "stripe" ? "#2bd49a" : "#fbbf24") : "oklch(0.62 0.01 250)" }} />
              <p className="text-[13px] font-medium">{label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: "oklch(0.62 0.01 250)" }}>{sub}</p>
            </button>
          ))}
        </div>

        {/* ── STRIPE flow ── */}
        {method === "stripe" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#ffffff" }}>{t("withdraw_amount")}</label>
              <input type="number" min={1} max={data.balance} step={0.01} value={amount}
                onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2bd49a")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.30 0.02 250)")} />
            </div>
            {!data.stripeConnected && (
              <div className="p-3 rounded-xl text-[13px]" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }}>
                <p className="font-medium" style={{ color: "#fbbf24" }}>Cuenta bancaria no conectada</p>
                <button onClick={handleStripeConnect} disabled={connectingStripe}
                  className="mt-2 flex items-center gap-1.5 text-[12px] font-medium hover:opacity-80" style={{ color: "#fbbf24" }}>
                  <Link2 className="h-3.5 w-3.5" />{t("connect_stripe")}
                </button>
              </div>
            )}
            {data.stripeConnected && (
              <div className="flex items-center gap-2 text-[13px]" style={{ color: "#2bd49a" }}>
                <CheckCircle className="h-4 w-4" />{t("stripe_connected")}
              </div>
            )}
            <button onClick={handleWithdraw} disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full py-3 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{ background: "#2bd49a", color: "#0c0c0a" }}>
              {loading ? "Procesando..." : t("withdraw")}
            </button>
          </div>
        )}

        {/* ── BONO flow ── */}
        {method === "bono" && (
          <div className="space-y-4">
            {data.availableBonos.length === 0 ? (
              <div className="py-6 text-center">
                <Gift className="h-8 w-8 mx-auto mb-2" style={{ color: "oklch(0.62 0.01 250)" }} />
                <p className="text-[13px]" style={{ color: "oklch(0.62 0.01 250)" }}>No hay bonos disponibles ahora mismo</p>
              </div>
            ) : (
              <>
                <p className="text-[13px]" style={{ color: "oklch(0.72 0.01 250)" }}>
                  Selecciona el bono que quieres canjear. Se descontará el valor mínimo de tu saldo y la empresa gestionará tu solicitud.
                </p>

                {/* Bono list */}
                <div className="space-y-2">
                  {data.availableBonos.map((bono) => {
                    const canAfford = data.balance >= (bono.bonusMinValue ?? 0)
                    const isSelected = selectedBono?.id === bono.id
                    return (
                      <button key={bono.id} onClick={() => setSelectedBono(isSelected ? null : bono)}
                        disabled={!canAfford}
                        className="w-full p-3 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? "rgba(251,191,36,0.10)" : canAfford ? "oklch(0.22 0.015 250)" : "oklch(0.19 0.015 250)",
                          border: isSelected ? "1px solid rgba(251,191,36,0.35)" : "1px solid oklch(0.30 0.02 250)",
                          opacity: canAfford ? 1 : 0.5,
                        }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[14px]" style={{ color: "#ffffff" }}>
                              {bono.bonusDescription ?? bono.title}
                            </p>
                            <p className="text-[12px] mt-0.5" style={{ color: "oklch(0.62 0.01 250)" }}>{bono.business.name}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="font-bold text-[15px]" style={{ color: "#2bd49a" }}>
                              {bono.bonusMinValue}€
                            </span>
                            <p className="text-[11px]" style={{ color: "oklch(0.62 0.01 250)" }}>mínimo</p>
                          </div>
                        </div>
                        {!canAfford && (
                          <p className="text-[11px] mt-1.5" style={{ color: "#dc2626" }}>
                            Necesitas {((bono.bonusMinValue ?? 0) - data.balance).toFixed(2)}€ más
                          </p>
                        )}
                        {isSelected && (
                          <div className="flex items-center gap-1 mt-1.5 text-[12px]" style={{ color: "#fbbf24" }}>
                            <CheckCircle className="h-3.5 w-3.5" /> Seleccionado
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {selectedBono && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }}>
                    <p className="text-[13px]" style={{ color: "#fbbf24" }}>
                      Se descontarán <strong>{selectedBono.bonusMinValue}€</strong> de tu saldo.
                      La empresa confirmará el canje en breve.
                    </p>
                  </div>
                )}

                <button onClick={handleRedeemBono} disabled={!selectedBono || loading}
                  className="w-full py-3 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 hover:opacity-90"
                  style={{ background: "#2bd49a", color: "#0c0c0a" }}>
                  <Gift className="h-4 w-4" />
                  {loading ? "Enviando..." : "Solicitar canje"}
                </button>
              </>
            )}

            {/* Pending redemptions */}
            {data.pendingRedemptions.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-3" style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)" }}>
                  Mis solicitudes
                </p>
                <div className="space-y-2">
                  {data.pendingRedemptions.map((r) => {
                    const statusStyle = {
                      PENDING:  { bg: "rgba(251,191,36,0.10)",  color: "#fbbf24", label: "Pendiente" },
                      APPROVED: { bg: "rgba(43,212,154,0.10)",  color: "#2bd49a", label: "Aprobado"  },
                      REJECTED: { bg: "rgba(220,38,38,0.12)",   color: "#dc2626", label: "Rechazado" },
                    }[r.status] ?? { bg: "oklch(0.30 0.02 250)", color: "oklch(0.72 0.01 250)", label: r.status }
                    return (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: "oklch(0.22 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
                        <div>
                          <p className="font-medium text-[13px]" style={{ color: "#ffffff" }}>
                            {r.campaign.bonusDescription ?? r.campaign.title}
                          </p>
                          <p className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>{r.campaign.business.name} · {r.amount}€</p>
                        </div>
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                          style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}30` }}>
                          {statusStyle.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl p-5" style={{ background: "oklch(0.19 0.015 250)", border: "1px solid oklch(0.30 0.02 250)" }}>
        <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4" style={{ color: "oklch(0.62 0.01 250)", fontFamily: "var(--font-mono)" }}>
          {t("history")}
        </p>
        {data.transactions.length === 0 ? (
          <p className="text-[13px]" style={{ color: "oklch(0.62 0.01 250)" }}>{t("no_transactions")}</p>
        ) : (
          <div className="space-y-1">
            {data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid oklch(0.30 0.02 250)" }}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: tx.type === "CREDIT" ? "rgba(43,212,154,0.10)" : "rgba(220,38,38,0.12)",
                      border: tx.type === "CREDIT" ? "1px solid rgba(43,212,154,0.20)" : "1px solid rgba(220,38,38,0.20)",
                    }}>
                    {tx.type === "CREDIT"
                      ? <ArrowDownRight className="h-4 w-4" style={{ color: "#2bd49a" }} />
                      : <ArrowUpRight className="h-4 w-4" style={{ color: "#dc2626" }} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#ffffff" }}>{tx.description}</p>
                    <p className="text-[12px]" style={{ color: "oklch(0.62 0.01 250)" }}>
                      {new Date(tx.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-[13px]" style={{ color: tx.type === "CREDIT" ? "#2bd49a" : "#dc2626" }}>
                  {tx.type === "CREDIT" ? "+" : "-"}{tx.amount.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
