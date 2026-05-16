"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle, Loader2 } from "lucide-react"

interface Props {
  reservationId: string
  status: string
}

export function ReservationActions({ reservationId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status !== "PENDING") return null

  const handleConfirm = async () => {
    setLoading(true)
    const res = await fetch(`/api/reservations/${reservationId}/confirm`, { method: "POST" })
    if (res.ok) {
      toast.success("Reserva confirmada")
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      if (err.error === "already_confirmed") toast.error("Ya estaba confirmada")
      else toast.error("Error al confirmar")
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
      style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D", border: "1px solid rgba(31,107,77,0.20)" }}
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <CheckCircle className="h-3.5 w-3.5" />}
      {loading ? "..." : "Confirmar"}
    </button>
  )
}
