"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode, Lock, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface StaffMember {
  id: string
  name: string
  email: string
  pin: string | null
}

export function StaffList({ staff }: { staff: StaffMember[] }) {
  const router = useRouter()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const res = await fetch(`/api/staff/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Trabajador eliminado")
      router.refresh()
    } else {
      toast.error("Error al eliminar el trabajador")
    }
    setDeleting(null)
    setConfirmId(null)
  }

  if (staff.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: "#88B5A2" }}>
        Sin personal registrado aún.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {staff.map((s) => (
        <div key={s.id}>
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: "#F2EBDC", border: "1px solid rgba(15,31,26,0.08)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0"
                style={{ background: "rgba(31,107,77,0.10)", color: "#1F6B4D" }}
              >
                {s.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[14px]" style={{ color: "#0F1F1A" }}>{s.name}</p>
                <p className="text-[12px]" style={{ color: "#88B5A2" }}>{s.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* PIN badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: "rgba(31,107,77,0.08)", border: "1px solid rgba(31,107,77,0.15)" }}
              >
                <Lock className="h-3 w-3" style={{ color: "#1F6B4D" }} />
                <span className="font-mono font-bold text-[14px] tracking-widest" style={{ color: "#1F6B4D" }}>
                  {s.pin ?? "—"}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[12px]" style={{ color: "#1F6B4D" }}>
                <QrCode className="h-3.5 w-3.5" />
                Activo
              </div>

              {/* Delete button */}
              <button
                onClick={() => setConfirmId(confirmId === s.id ? null : s.id)}
                className="h-8 w-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)" }}
              >
                <Trash2 className="h-3.5 w-3.5" style={{ color: "#dc2626" }} />
              </button>
            </div>
          </div>

          {/* Inline confirm */}
          {confirmId === s.id && (
            <div
              className="mt-1.5 p-3 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "#dc2626" }} />
              <p className="text-[13px] flex-1" style={{ color: "#dc2626" }}>
                ¿Eliminar a <strong>{s.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-opacity hover:opacity-70"
                  style={{ background: "rgba(15,31,26,0.08)", color: "#2A3B34" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deleting === s.id}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "#dc2626", color: "#fff" }}
                >
                  {deleting === s.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
