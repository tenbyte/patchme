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

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/systems", label: "Systems" },
  { href: "/baselines", label: "Baselines" },
  { href: "/tags", label: "Tags" },
  { href: "/settings", label: "Settings" },
]

export default function TopBar({ userName = "Admin" }: { userName?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
      <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/15 text-emerald-400 p-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-semibold">PatchMe</span>
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
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 gap-2">
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{`Welcome, ${userName}`}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Signed in as {userName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/login")} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
