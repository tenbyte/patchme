import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import TopBar from "@/components/topbar"
import ToasterProvider from "@/components/toaster-provider"

export const metadata: Metadata = {
  title: 'PatchMe',
  description: 'PatchMe Dashboard'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const token = (await cookieStore).get("pmsession")?.value
  let userName = "Guest"
  let userRole = "user"
  if (token) {
    try {
      const payload: any = jwt.verify(token, process.env.JWT_SECRET || "changeme-supersecret")
      userName = payload.name
      userRole = payload.role
    } catch {}
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TopBar userName={userName} userRole={userRole} />
          {children}
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
