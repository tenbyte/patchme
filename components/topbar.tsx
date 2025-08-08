"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShieldCheck, UserIcon, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TopBar({ userName, userRole }: { userName?: string, userRole?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoggedIn = !!userName && userName !== "Guest"

  const nav = [
    { href: "/", label: "Dashboard" },
    { href: "/systems", label: "Systems" },
    { href: "/baselines", label: "Baselines" },
    { href: "/tags", label: "Tags" },
    ...(userRole === "admin" ? [{ href: "/settings", label: "Settings" }] : [])
  ]

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
      <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/15 text-emerald-400 p-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-semibold">PatchMe</span>
          {isLoggedIn && (
            <nav className="ml-4 hidden md:flex items-center gap-1">
              {nav.map((n) => {
                const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {n.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 gap-2">
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{isLoggedIn ? `Welcome, ${userName}` : "Welcome, Guest"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {isLoggedIn ? `Signed in as ${userName}` : "Not signed in"}
              </DropdownMenuLabel>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Role: {isLoggedIn ? userRole : "-"}
              </div>
              <DropdownMenuSeparator />
              {isLoggedIn ? (
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
