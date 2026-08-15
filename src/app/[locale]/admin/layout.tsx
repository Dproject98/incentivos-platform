import { SidebarAdmin } from "@/components/layout/sidebar-admin"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "oklch(0.15 0.012 250)" }}>
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
