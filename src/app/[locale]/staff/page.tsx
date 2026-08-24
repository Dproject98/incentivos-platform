import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { CheckCircle, Clock, LogOut, Smartphone, Lock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IncentisLogo } from "@/components/IncentisLogo"

export default async function StaffPage() {
  const session = await auth()
  if (!session || session.user.role !== "STAFF") redirect("/es/login")

  const locale = await getLocale()

  // BusinessStaff is linked by email (no userId field)
  const staffRecord = await prisma.businessStaff.findFirst({
    where: { email: session.user.email ?? "" },
    include: {
      business: {
        include: {
          campaigns: {
            select: {
              id: true,
              title: true,
              reservations: {
                orderBy: { updatedAt: "desc" },
                take: 10,
                select: {
                  id: true,
                  clientName: true,
                  date: true,
                  time: true,
                  status: true,
                  updatedAt: true,
                  campaign: { select: { title: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  const business = staffRecord?.business ?? null

  const recentReservations = business
    ? business.campaigns
        .flatMap((c) => c.reservations)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
    : []

  const today = new Date().toDateString()
  const confirmedToday = recentReservations.filter(
    (r) => r.status === "CONFIRMED" && new Date(r.updatedAt).toDateString() === today
  ).length

  const statusStyle: Record<string, { bg: string; color: string; border: string; label: string }> = {
    PENDING:   { label: "Pendiente",  bg: "rgba(251,191,36,0.10)",  color: "#D9B36C", border: "rgba(251,191,36,0.25)" },
    CONFIRMED: { label: "Confirmada", bg: "rgba(43,212,154,0.10)",  color: "#E8735A", border: "rgba(43,212,154,0.20)" },
    CANCELLED: { label: "Cancelada",  bg: "rgba(220,38,38,0.12)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
    NO_SHOW:   { label: "No show",    bg: "#34373C",   color: "#AEB2B8", border: "#34373C" },
  }

  return (
    <div className="min-h-screen" style={{ background: "#16171A" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: "#1E2023", borderBottom: "1px solid #34373C" }}
      >
        <IncentisLogo size="sm" />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[13px] font-medium" style={{ color: "#F2F1EF" }}>
              {staffRecord?.name ?? session.user.name}
            </p>
            {business && (
              <p className="text-[12px]" style={{ color: "#93979E" }}>{business.name}</p>
            )}
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: `/${locale}/login` })
            }}
          >
            <button
              type="submit"
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: "#26282C", border: "1px solid #34373C" }}
            >
              <LogOut className="h-4 w-4" style={{ color: "#93979E" }} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1
            className="font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: "#F2F1EF",
              fontSize: "clamp(22px,5vw,28px)",
              letterSpacing: "-0.03em",
            }}
          >
            Hola, {(staffRecord?.name ?? session.user.name ?? "").split(" ")[0]}
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#93979E" }}>
            {business ? `Personal autorizado — ${business.name}` : "Panel de validación QR"}
          </p>
        </div>

        {/* PIN card — most prominent element */}
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: "oklch(0.70 0.15 35 / 0.15)", border: "1px solid oklch(0.70 0.15 35 / 0.25)" }}
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(43,212,154,0.10)", border: "1px solid rgba(43,212,154,0.20)" }}
          >
            <Lock className="h-6 w-6" style={{ color: "#E8735A" }} />
          </div>
          <div className="flex-1">
            <p
              className="text-[10px] uppercase tracking-[0.12em] font-mono mb-1"
              style={{ color: "#93979E", fontFamily: "var(--font-mono)" }}
            >
              Tu PIN de validación
            </p>
            {staffRecord?.pin ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {staffRecord.pin.split("").map((digit, i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-[20px]"
                      style={{ background: "rgba(43,212,154,0.12)", color: "#E8735A" }}
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <p className="text-[12px]" style={{ color: "#93979E" }}>
                  Introdúcelo al escanear el QR
                </p>
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: "#AEB2B8" }}>
                PIN no asignado — contacta con tu empresa
              </p>
            )}
          </div>
        </div>

        {/* Validaciones hoy */}
        <div
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{ background: "#1E2023", border: "1px solid #34373C" }}
        >
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.12em] font-mono"
              style={{ color: "#93979E", fontFamily: "var(--font-mono)" }}
            >
              Validaciones hoy
            </p>
            <span className="text-[40px] font-bold leading-tight" style={{ color: "#F2F1EF" }}>
              {confirmedToday}
            </span>
          </div>
          <CheckCircle className="h-8 w-8" style={{ color: "#E8735A" }} />
        </div>

        {/* Instrucciones */}
        <div
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "#1E2023", border: "1px solid #34373C" }}
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(43,212,154,0.08)", border: "1px solid rgba(43,212,154,0.15)" }}
          >
            <Smartphone className="h-5 w-5" style={{ color: "#E8735A" }} />
          </div>
          <div>
            <p className="font-medium text-[14px] mb-1.5" style={{ color: "#F2F1EF" }}>Cómo validar una reserva</p>
            <ol className="text-[13px] space-y-1.5" style={{ color: "#AEB2B8" }}>
              <li>1. El cliente muestra el código QR en su teléfono</li>
              <li>2. Escanéalo con la cámara de tu dispositivo</li>
              <li>3. Introduce tu <strong>PIN de 4 dígitos</strong> en la pantalla</li>
              <li>4. La reserva queda confirmada automáticamente</li>
            </ol>
            <p className="text-[12px] mt-2" style={{ color: "#93979E" }}>
              El incentivo se acredita al captador al instante.
            </p>
          </div>
        </div>

        {/* Reservas recientes */}
        {recentReservations.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
            <p
              className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4 flex items-center gap-2"
              style={{ color: "#93979E", fontFamily: "var(--font-mono)" }}
            >
              <Clock className="h-3.5 w-3.5" />
              Reservas recientes ({recentReservations.length})
            </p>
            <div className="space-y-2">
              {recentReservations.map((r) => {
                const ss = statusStyle[r.status] ?? statusStyle.PENDING
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "#26282C", border: "1px solid #34373C" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center font-semibold text-[12px] shrink-0"
                        style={{ background: "rgba(43,212,154,0.10)", color: "#E8735A" }}
                      >
                        {r.clientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[13px]" style={{ color: "#F2F1EF" }}>{r.clientName}</p>
                        <p className="text-[11px]" style={{ color: "#93979E" }}>
                          {r.campaign.title} · {format(new Date(r.date), "dd MMM", { locale: es })} {r.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
                    >
                      {ss.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
