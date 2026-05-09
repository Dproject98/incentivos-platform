"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode } from "react"

const SpaceScene = dynamic(
  () => import("./SpaceScene").then((m) => ({ default: m.SpaceScene })),
  { ssr: false }
)

class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

interface SpaceBackgroundProps {
  minimal?: boolean
  className?: string
}

export function SpaceBackground({ minimal = false, className = "" }: SpaceBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`} style={{ background: "#0a0e27" }}>
      {/* 3D scene temporarily disabled - CSS fallback */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.10) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(6,182,212,0.08) 0%, transparent 50%)",
      }} />
      {/* Stars CSS */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 40% 20%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 55% 70%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 70% 35%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 80% 60%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 35% 90%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 60% 50%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 75% 85%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 5% 55%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 48% 8%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 88% 42%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 95% 75%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 30% 65%, rgba(255,255,255,0.3) 0%, transparent 100%)",
      }} />
    </div>
  )
}
