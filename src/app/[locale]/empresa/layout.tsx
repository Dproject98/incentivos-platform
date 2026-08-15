import { SidebarEmpresa } from "@/components/layout/sidebar-empresa"

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "oklch(0.15 0.012 250)" }}>
      <SidebarEmpresa />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
