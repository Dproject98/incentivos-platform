"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Wallet, ArrowDownRight, ArrowUpRight, Link2, CheckCircle, CreditCard, Gift } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  type: "CREDIT" | "DEBIT"
  description: string
  createdAt: string
}

interface WalletData {
  balance: number
  transactions: Transaction[]
  stripeConnected: boolean
}

const inputStyle = {
  background: "#F2EBDC",
  border: "1px solid rgba(15,31,26,0.15)",
  color: "#0F1F1A",
}

export default function WalletPage() {
  const t = useTranslations("captador.wallet")
  const locale = useLocale()

  const [data, setData] = useState<WalletData | null>(null)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<"stripe" | "bono">("stripe")
  const [loading, setLoading] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)

  useEffect(() => {
    fetch("/api/wallet").then((r) => r.json()).then(setData)
  }, [])

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) return
    setLoading(true)
    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountNum, method }),
    })
    if (!res.ok) {
      const err = await res.json()
      if (err.error === "insufficient_balance") toast.error(t("insufficient_balance"))
      else if (err.error === "no_stripe_account") toast.error("Conecta primero tu cuenta bancaria")
      else toast.error("Error al procesar el retiro")
      setLoading(false)
      return
    }
    toast.success("Retiro solicitado con éxito")
    setAmount("")
    const updated = await fetch("/api/wallet").then((r) => r.json())
    setData(updated)
    setLoading(false)
  }

  const handleStripeConnect = async () => {
    setConnectingStripe(true)
    const res = await fetch("/api/wallet/stripe-connect", { method: "POST" })
    const { url } = await res.json()
    if (url) window.location.href = url
    setConnectingStripe(false)
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-48">
        <div
          className="h-8 w-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(31,107,77,0.20)", borderTopColor: "#1F6B4D" }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#0F1F1A", fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.03em" }}>
          {t("title")}
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "#88B5A2" }}>Tu saldo e historial de incentivos</p>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl p-6" style={{ background: "#1F6B4D" }}>
        <div className="flex items-center gap-2 mb-3 text-[13px]" style={{ color: "rgba(242,235,220,0.70)" }}>
          <Wallet className="h-4 w-4" />
          {t("balance")}
        </div>
        <div className="text-[48px] font-bold leading-none" style={{ color: "#F2EBDC" }}>
          {data.balance.toFixed(2)} <span style={{ color: "#D88B2E" }}>€</span>
        </div>
        <p className="text-[13px] mt-2" style={{ color: "rgba(242,235,220,0.55)" }}>Disponible para retirar</p>
      </div>

      {/* Withdraw form */}
      <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
        <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          {t("withdraw")}
        </p>

        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>{t("withdraw_amount")}</label>
            <input
              type="number" min={1} max={data.balance} step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1F6B4D")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")}
            />
          </div>

          {/* Method */}
          <div>
            <label className="block text-[13px] font-medium mb-2" style={{ color: "#0F1F1A" }}>{t("withdraw_method")}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMethod("stripe")}
                className="p-3 rounded-xl text-left transition-all"
                style={{
                  background: method === "stripe" ? "rgba(31,107,77,0.08)" : "#F2EBDC",
                  border: method === "stripe" ? "1px solid rgba(31,107,77,0.25)" : "1px solid rgba(15,31,26,0.12)",
                  color: method === "stripe" ? "#1F6B4D" : "#2A3B34",
                }}
              >
                <CreditCard className="h-4 w-4 mb-1.5" style={{ color: method === "stripe" ? "#1F6B4D" : "#88B5A2" }} />
                <p className="text-[13px] font-medium">{t("stripe_transfer")}</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#88B5A2" }}>Transferencia bancaria</p>
              </button>
              <button
                onClick={() => setMethod("bono")}
                className="p-3 rounded-xl text-left transition-all"
                style={{
                  background: method === "bono" ? "rgba(216,139,46,0.10)" : "#F2EBDC",
                  border: method === "bono" ? "1px solid rgba(216,139,46,0.25)" : "1px solid rgba(15,31,26,0.12)",
                  color: method === "bono" ? "#B5710D" : "#2A3B34",
                }}
              >
                <Gift className="h-4 w-4 mb-1.5" style={{ color: method === "bono" ? "#B5710D" : "#88B5A2" }} />
                <p className="text-[13px] font-medium">{t("bono")}</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#88B5A2" }}>Canjear como bono</p>
              </button>
            </div>
          </div>

          {method === "stripe" && !data.stripeConnected && (
            <div
              className="p-3 rounded-xl text-[13px]"
              style={{ background: "rgba(216,139,46,0.08)", border: "1px solid rgba(216,139,46,0.20)" }}
            >
              <p className="font-medium" style={{ color: "#B5710D" }}>Cuenta bancaria no conectada</p>
              <button
                onClick={handleStripeConnect}
                disabled={connectingStripe}
                className="mt-2 flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-80"
                style={{ color: "#B5710D" }}
              >
                <Link2 className="h-3.5 w-3.5" />
                {t("connect_stripe")}
              </button>
            </div>
          )}

          {method === "stripe" && data.stripeConnected && (
            <div className="flex items-center gap-2 text-[13px]" style={{ color: "#1F6B4D" }}>
              <CheckCircle className="h-4 w-4" />
              {t("stripe_connected")}
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full py-3 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ background: "#1F6B4D", color: "#F2EBDC" }}
          >
            {loading ? "Procesando..." : t("withdraw")}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
        <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
          {t("history")}
        </p>
        {data.transactions.length === 0 ? (
          <p className="text-[13px]" style={{ color: "#88B5A2" }}>{t("no_transactions")}</p>
        ) : (
          <div className="space-y-1">
            {data.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid rgba(15,31,26,0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: tx.type === "CREDIT" ? "rgba(31,107,77,0.10)" : "rgba(220,38,38,0.08)",
                      border: tx.type === "CREDIT" ? "1px solid rgba(31,107,77,0.20)" : "1px solid rgba(220,38,38,0.15)",
                    }}
                  >
                    {tx.type === "CREDIT"
                      ? <ArrowDownRight className="h-4 w-4" style={{ color: "#1F6B4D" }} />
                      : <ArrowUpRight className="h-4 w-4" style={{ color: "#dc2626" }} />}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#0F1F1A" }}>{tx.description}</p>
                    <p className="text-[12px]" style={{ color: "#88B5A2" }}>
                      {new Date(tx.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
                    </p>
                  </div>
                </div>
                <span
                  className="font-semibold text-[13px]"
                  style={{ color: tx.type === "CREDIT" ? "#1F6B4D" : "#dc2626" }}
                >
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
