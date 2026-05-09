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

  const statusConfig: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: t("status_pending"),   cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    CONFIRMED: { label: t("status_confirmed"), cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    CANCELLED: { label: t("status_cancelled"), cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    NO_SHOW:   { label: t("status_no_show"),   cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  }

  const sc = statusConfig[reservation.status] ?? statusConfig.PENDING

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/captador/reservas`}>
          <button className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-slate-400" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white truncate">{reservation.clientName}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
          </div>
          <p className="text-sm text-slate-500">{reservation.campaign.business.name} · {reservation.campaign.title}</p>
        </div>
      </div>

      {/* Details */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">Detalles de la reserva</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-500">{t("date")}</p>
              <p className="text-white font-medium">{format(new Date(reservation.date), "dd MMM yyyy", { locale: dateLocale })}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-500">{t("time")}</p>
              <p className="text-white font-medium">{reservation.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-500">{t("guests")}</p>
              <p className="text-white font-medium">{reservation.guests} personas</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-500">{t("created")}</p>
              <p className="text-white font-medium">{format(new Date(reservation.createdAt), "dd MMM yyyy", { locale: dateLocale })}</p>
            </div>
          </div>
        </div>
        {reservation.notes && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2 text-sm">
            <FileText className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-slate-500">{t("notes")}</p>
              <p className="text-white mt-1">{reservation.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs text-slate-500 uppercase tracking-widest">Código QR</h2>
          {reservation.status === "CONFIRMED" && (
            <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
              <CheckCircle className="h-4 w-4" /> Validado
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="p-3 bg-white rounded-2xl">
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 block" />
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-purple-400" /> Enviado por email</span>
            <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-green-400" /> Por WhatsApp</span>
          </div>

          <a
            href={`/api/reservations/${reservation.id}/qr`}
            download={`qr-${reservation.id}.png`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            {t("download_qr")}
          </a>
        </div>
      </div>
    </div>
  )
}
