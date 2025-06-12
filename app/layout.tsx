import type React from "react"
import { ClientLayout } from "@/components/client-layout"
import "@/app/globals.css"

export const metadata = {
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
