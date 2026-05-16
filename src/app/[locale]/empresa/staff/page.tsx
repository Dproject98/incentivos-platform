import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Users, Smartphone } from "lucide-react"
import { AddStaffForm } from "./add-staff-form"
import { StaffList } from "./staff-list"

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
        <h1
          className="font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            color: "#0F1F1A",
            fontSize: "clamp(22px,3vw,30px)",
            letterSpacing: "-0.03em",
          }}
        >
          {t("title")}
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "#88B5A2" }}>
          Personal autorizado para validar QR
        </p>
      </div>

      {/* Info banner */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "rgba(31,107,77,0.06)", border: "1px solid rgba(31,107,77,0.15)" }}
      >
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(31,107,77,0.10)", border: "1px solid rgba(31,107,77,0.20)" }}
        >
          <Smartphone className="h-4 w-4" style={{ color: "#1F6B4D" }} />
        </div>
        <div>
          <p className="text-[14px] font-medium" style={{ color: "#0F1F1A" }}>Cómo funciona</p>
          <p className="text-[13px] mt-1" style={{ color: "#2A3B34" }}>{t("desc")}</p>
          <p className="text-[12px] mt-1.5" style={{ color: "#88B5A2" }}>
            Cada trabajador recibe un <strong>PIN único de 4 dígitos</strong>. Lo introduce al escanear el QR del cliente para verificar su identidad.
          </p>
        </div>
      </div>

      {/* Add staff */}
      <AddStaffForm />

      {/* Staff list */}
      <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(15,31,26,0.08)" }}>
        <p
          className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4 flex items-center gap-2"
          style={{ color: "#88B5A2", fontFamily: "var(--font-mono)" }}
        >
          <Users className="h-3.5 w-3.5" />
          Personal registrado ({business.staff.length})
        </p>

        <StaffList staff={business.staff} />
      </div>
    </div>
  )
}
