"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Pause, Play } from "lucide-react"

interface Props {
  campaignId: string
  status: string
  locale: string
}

export function CampaignActions({ campaignId, status }: Props) {
  const t = useTranslations("empresa.campaigns")
  const router = useRouter()

  const toggle = async () => {
    const newStatus = status === "ACTIVE" ? "PAUSED" : "ACTIVE"
    const res = await fetch(`/api/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      toast.success(newStatus === "ACTIVE" ? "Campaña activada" : "Campaña pausada")
      router.refresh()
    }
  }

  if (status === "ENDED") return null

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
    >
      {status === "ACTIVE" ? (
        <><Pause className="h-3.5 w-3.5" />{t("pause")}</>
      ) : (
        <><Play className="h-3.5 w-3.5" />{t("activate")}</>
      )}
    </button>
  )
}
