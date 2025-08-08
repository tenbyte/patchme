import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { cookies } from "next/headers"
import { PrismaClient } from "@/lib/generated/prisma/client"
import TopBar from "@/components/topbar"

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
  const sessionToken = (await cookieStore).get("pmsession")?.value
  let userName = "Guest"
  let userRole = "user"
  if (sessionToken) {
    const prisma = new PrismaClient()
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    })
    if (session && session.user) {
      userName = session.user.name
      userRole = session.user.role
    }
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
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TopBar userName={userName} userRole={userRole} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
