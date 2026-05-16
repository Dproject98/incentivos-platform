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
      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-full text-[13px] font-medium transition-all hover:opacity-80"
      style={{
        background: status === "ACTIVE" ? "rgba(216,139,46,0.10)" : "rgba(31,107,77,0.10)",
        color: status === "ACTIVE" ? "#B5710D" : "#1F6B4D",
        border: `1px solid ${status === "ACTIVE" ? "rgba(216,139,46,0.25)" : "rgba(31,107,77,0.20)"}`,
      }}
    >
      {status === "ACTIVE" ? (
        <><Pause className="h-3.5 w-3.5" />{t("pause")}</>
      ) : (
        <><Play className="h-3.5 w-3.5" />{t("activate")}</>
      )}
    </button>
  )
}
