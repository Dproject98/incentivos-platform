"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, User, Mail } from "lucide-react"

export function AddStaffForm() {
  const t = useTranslations("empresa.staff")
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "" })
  const [loading, setLoading] = useState(false)

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
    <div className="glass rounded-2xl border border-white/10 p-5">
      <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <UserPlus className="h-3.5 w-3.5" />
        {t("add")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("name")}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre del empleado"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">{t("email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="empleado@empresa.com"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          {loading ? "Añadiendo..." : t("invite")}
        </button>
      </form>
    </div>
  )
}
