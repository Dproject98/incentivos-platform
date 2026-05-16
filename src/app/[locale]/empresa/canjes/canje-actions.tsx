"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle, X, Loader2 } from "lucide-react"

export function CanjeActions({ redemptionId, status }: { redemptionId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  if (status !== "PENDING") return null

  const handle = async (action: "approve" | "reject") => {
    setLoading(action)
    const res = await fetch(`/api/empresa/canjes/${redemptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      toast.success(action === "approve" ? "Canje aprobado" : "Canje rechazado y saldo reembolsado")
      router.refresh()
    } else {
      toast.error("Error al procesar la solicitud")
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => handle("approve")} disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D", border: "1px solid rgba(31,107,77,0.20)" }}>
        {loading === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
        Aprobar
      </button>
      <button onClick={() => handle("reject")} disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{ background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)" }}>
        {loading === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        Rechazar
      </button>
    </div>
  )
}
