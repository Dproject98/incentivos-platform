import { SidebarEmpresa } from "@/components/layout/sidebar-empresa"
import { SpaceBackground } from "@/components/3d/SpaceBackground"

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative">
      <SpaceBackground minimal />
      <SidebarEmpresa />
      <main className="flex-1 p-8 overflow-auto relative z-10">{children}</main>
    </div>
  )
}
