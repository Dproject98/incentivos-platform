import { SidebarCaptador } from "@/components/layout/sidebar-captador"

export default function CaptadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F2EBDC" }}>
      <SidebarCaptador />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
