import { SidebarEmpresa } from "@/components/layout/sidebar-empresa"

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F2EBDC" }}>
      <SidebarEmpresa />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
