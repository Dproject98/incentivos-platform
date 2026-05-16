import { Inter, Space_Grotesk, Inter_Tight, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "../globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] })
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["500"] })

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans" style={{ background: "#F2EBDC" }}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
