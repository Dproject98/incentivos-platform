import { SidebarEmpresa } from "@/components/layout/sidebar-empresa"

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#16171A" }}>
      <SidebarEmpresa />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
