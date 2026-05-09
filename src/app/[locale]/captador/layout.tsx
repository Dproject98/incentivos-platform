import { SidebarCaptador } from "@/components/layout/sidebar-captador"
import { SpaceBackground } from "@/components/3d/SpaceBackground"

export default function CaptadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative">
      <SpaceBackground minimal />
      <SidebarCaptador />
      <main className="flex-1 p-8 overflow-auto relative z-10">{children}</main>
    </div>
  )
}
