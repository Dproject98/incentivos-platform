"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

export function AddStaffForm() {
  const t = useTranslations("empresa.staff")
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "" })
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    background: "#F2EBDC",
    border: "1px solid rgba(15,31,26,0.15)",
    color: "#0F1F1A",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success("Personal añadido con éxito")
      setForm({ name: "", email: "" })
      router.refresh()
    } else {
      toast.error("Error al añadir personal")
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
      <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4 flex items-center gap-2" style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}>
        <UserPlus className="h-3.5 w-3.5" />
        {t("add")}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>{t("name")}</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del empleado"
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1F6B4D")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#0F1F1A" }}>{t("email")}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="empleado@empresa.com"
              className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1F6B4D")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(15,31,26,0.15)")}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-opacity disabled:opacity-60 hover:opacity-90"
          style={{ background: "#1F6B4D", color: "#F2EBDC" }}
        >
          <UserPlus className="h-4 w-4" />
          {loading ? "Añadiendo..." : t("invite")}
        </button>
      </form>
    </div>
  )
}
