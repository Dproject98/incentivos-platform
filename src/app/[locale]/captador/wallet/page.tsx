"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        <div className="h-8 w-8 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">Tu saldo e historial de incentivos</p>
      </div>

      {/* Balance card */}
      <div className="glass rounded-2xl p-6 border border-pink-500/20 shadow-glow-pink">
        <div className="flex items-center gap-2 text-pink-300 text-sm mb-3">
          <Wallet className="h-4 w-4" />
          {t("balance")}
        </div>
        <div className="text-5xl font-bold text-white">{data.balance.toFixed(2)} <span className="text-pink-400">€</span></div>
        <p className="text-slate-500 text-sm mt-2">Disponible para retirar</p>
      </div>

      {/* Withdraw form */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t("withdraw")}</h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("withdraw_amount")}</Label>
            <Input
              type="number" min={1} max={data.balance} step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("withdraw_method")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMethod("stripe")}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  method === "stripe"
                    ? "border-purple-500/40 bg-purple-500/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/8"
                }`}
              >
                <CreditCard className={`h-4 w-4 mb-1.5 ${method === "stripe" ? "text-purple-400" : "text-slate-500"}`} />
                <p className="font-medium">{t("stripe_transfer")}</p>
                <p className="text-xs text-slate-500 mt-0.5">Transferencia bancaria</p>
              </button>
              <button
                onClick={() => setMethod("bono")}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${
                  method === "bono"
                    ? "border-pink-500/40 bg-pink-500/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/8"
                }`}
              >
                <Gift className={`h-4 w-4 mb-1.5 ${method === "bono" ? "text-pink-400" : "text-slate-500"}`} />
                <p className="font-medium">{t("bono")}</p>
                <p className="text-xs text-slate-500 mt-0.5">Canjear como bono</p>
              </button>
            </div>
          </div>

          {method === "stripe" && !data.stripeConnected && (
            <div className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-sm">
              <p className="font-medium text-yellow-300">Cuenta bancaria no conectada</p>
              <button
                onClick={handleStripeConnect}
                disabled={connectingStripe}
                className="mt-2 flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors"
              >
                <Link2 className="h-3.5 w-3.5" />
                {t("connect_stripe")}
              </button>
            </div>
          )}

          {method === "stripe" && data.stripeConnected && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              {t("stripe_connected")}
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all"
          >
            {loading ? "Procesando..." : t("withdraw")}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t("history")}</h2>
        {data.transactions.length === 0 ? (
          <p className="text-slate-600 text-sm">{t("no_transactions")}</p>
        ) : (
          <div className="space-y-1">
            {data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === "CREDIT" ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                  }`}>
                    {tx.type === "CREDIT"
                      ? <ArrowDownRight className="h-4 w-4 text-green-400" />
                      : <ArrowUpRight className="h-4 w-4 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-white">{tx.description}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES")}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${tx.type === "CREDIT" ? "text-green-400" : "text-red-400"}`}>
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
