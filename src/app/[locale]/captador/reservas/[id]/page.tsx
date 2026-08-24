import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { ArrowLeft, Download, Mail, MessageCircle, CheckCircle, Calendar, Clock, Users, FileText } from "lucide-react"
import Link from "next/link"
import { generateQRDataURL } from "@/lib/qr"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

export default async function ReservaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== "CAPTADOR") redirect("/es/login")

  const { locale, id } = await params
  const t = await getTranslations("captador.reservations")
  const dateLocale = locale === "en" ? enUS : es

  const reservation = await prisma.reservation.findUnique({
    where: { id, captadorId: session.user.id },
    include: { campaign: { include: { business: { select: { name: true } } } } },
  })

  if (!reservation) notFound()

  const qrDataUrl = await generateQRDataURL(reservation.qrToken)

  const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    PENDING:   { label: t("status_pending"),   bg: "rgba(217,179,108,0.10)",  color: "#D9B36C", border: "rgba(217,179,108,0.25)" },
    CONFIRMED: { label: t("status_confirmed"), bg: "rgba(232,115,90,0.10)",  color: "#E8735A", border: "rgba(232,115,90,0.20)" },
    CANCELLED: { label: t("status_cancelled"), bg: "rgba(220,38,38,0.12)",   color: "#dc2626", border: "rgba(220,38,38,0.20)" },
    NO_SHOW:   { label: t("status_no_show"),   bg: "#34373C",   color: "#AEB2B8", border: "#34373C" },
  }

  const sc = statusConfig[reservation.status] ?? statusConfig.PENDING

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/captador/reservas`}>
          <button
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background: "#26282C", border: "1px solid #34373C" }}
          >
            <ArrowLeft className="h-4 w-4" style={{ color: "#F2F1EF" }} />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-[20px] truncate" style={{ fontFamily: "var(--font-display)", color: "#F2F1EF", letterSpacing: "-0.03em" }}>
              {reservation.clientName}
            </h1>
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
              style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
            >
              {sc.label}
            </span>
          </div>
          <p className="text-[13px]" style={{ color: "#93979E" }}>
            {reservation.campaign.business.name} · {reservation.campaign.title}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl p-5" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
        <p className="text-[10px] uppercase tracking-[0.12em] font-mono mb-4" style={{ color: "#93979E", fontFamily: "var(--font-mono)" }}>
          Detalles de la reserva
        </p>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#E8735A" }} />
            <div>
              <p style={{ color: "#93979E" }}>{t("date")}</p>
              <p className="font-medium" style={{ color: "#F2F1EF" }}>
                {format(new Date(reservation.date), "dd MMM yyyy", { locale: dateLocale })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#E8735A" }} />
            <div>
              <p style={{ color: "#93979E" }}>{t("time")}</p>
              <p className="font-medium" style={{ color: "#F2F1EF" }}>{reservation.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#E8735A" }} />
            <div>
              <p style={{ color: "#93979E" }}>{t("guests")}</p>
              <p className="font-medium" style={{ color: "#F2F1EF" }}>{reservation.guests} personas</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#93979E" }} />
            <div>
              <p style={{ color: "#93979E" }}>{t("created")}</p>
              <p className="font-medium" style={{ color: "#F2F1EF" }}>
                {format(new Date(reservation.createdAt), "dd MMM yyyy", { locale: dateLocale })}
              </p>
            </div>
          </div>
        </div>
        {reservation.notes && (
          <div className="mt-4 pt-4 flex items-start gap-2 text-[13px]" style={{ borderTop: "1px solid #34373C" }}>
            <FileText className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#93979E" }} />
            <div>
              <p style={{ color: "#93979E" }}>{t("notes")}</p>
              <p className="mt-1" style={{ color: "#F2F1EF" }}>{reservation.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="rounded-2xl p-5" style={{ background: "#1E2023", border: "1px solid #34373C" }}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] uppercase tracking-[0.12em] font-mono" style={{ color: "#93979E", fontFamily: "var(--font-mono)" }}>
            Código QR
          </p>
          {reservation.status === "CONFIRMED" && (
            <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "#E8735A" }}>
              <CheckCircle className="h-4 w-4" /> Validado
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="p-3 bg-white rounded-2xl" style={{ border: "1px solid #34373C" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 block" />
          </div>

          <div className="flex items-center gap-5 text-[12px]" style={{ color: "#93979E" }}>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" style={{ color: "#E8735A" }} /> Enviado por email
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" style={{ color: "#E8735A" }} /> Por WhatsApp
            </span>
          </div>

          <a
            href={`/api/reservations/${reservation.id}/qr`}
            download={`qr-${reservation.id}.png`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition-opacity hover:opacity-80"
            style={{ background: "#26282C", border: "1px solid #34373C", color: "#F2F1EF" }}
          >
            <Download className="h-4 w-4" style={{ color: "#93979E" }} />
            {t("download_qr")}
          </a>
        </div>
      </div>
    </div>
  )
}
