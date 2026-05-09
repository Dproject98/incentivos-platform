import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Users, QrCode, Smartphone } from "lucide-react"
import { AddStaffForm } from "./add-staff-form"

export default async function EmpresaStaffPage() {
  const session = await auth()
  if (!session || session.user.role !== "EMPRESA") redirect("/es/login")

  const locale = await getLocale()
  const t = await getTranslations("empresa.staff")

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
    include: { staff: { orderBy: { createdAt: "desc" } } },
  })
  if (!business) redirect(`/${locale}/empresa/dashboard`)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <p className="text-slate-400 mt-1">Personal autorizado para validar QR</p>
      </div>

      {/* Info banner */}
      <div className="glass rounded-2xl p-4 border border-cyan-500/20 flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Smartphone className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm text-slate-300 font-medium">Cómo funciona</p>
          <p className="text-sm text-slate-500 mt-1">{t("desc")}</p>
        </div>
      </div>

      {/* Add staff form */}
      <AddStaffForm />

      {/* Staff list */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          Personal registrado ({business.staff.length})
        </h2>

        {business.staff.length === 0 ? (
          <p className="text-slate-600 text-sm">{t("empty")}</p>
        ) : (
          <div className="space-y-2">
            {business.staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <QrCode className="h-3.5 w-3.5" />
                  Activo
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
