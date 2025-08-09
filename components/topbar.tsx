"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShieldCheck, UserIcon, LogOut, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import Cookies from "js-cookie"
import { COOKIE_NAME } from "@/middleware"
import { useState } from "react"

export default function TopBar({ userName, userRole }: { userName?: string, userRole?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoggedIn = !!userName && userName !== "Guest"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const nav = [
    { href: "/", label: "Dashboard" },
    { href: "/systems", label: "Systems" },
    { href: "/baselines", label: "Baselines" },
    { href: "/tags", label: "Tags" },
    ...(userRole === "admin" ? [{ href: "/settings", label: "Settings" }] : [])
  ]

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    Cookies.remove(COOKIE_NAME, { path: "/" })
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
          {/* Desktop Navigation */}
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
          {/* Desktop User Menu */}
          <div className="hidden md:block">
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

          {/* Mobile Menu */}
          {isLoggedIn && (
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <div className="rounded-lg bg-emerald-500/15 text-emerald-400 p-2">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      PatchMe
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* User Info */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4" />
                        <span className="font-medium">{isLoggedIn ? userName : "Guest"}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Role: {isLoggedIn ? userRole : "-"}
                      </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground px-2 mb-3">Navigation</div>
                      {nav.map((n) => {
                        const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
                        return (
                          <SheetClose asChild key={n.href}>
                            <Link
                              href={n.href}
                              className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm transition-colors w-full",
                                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {n.label}
                            </Link>
                          </SheetClose>
                        )
                      })}
                    </nav>

                    {/* Logout */}
                    {isLoggedIn && (
                      <div className="pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Mobile User Icon for non-logged in users */}
          {!isLoggedIn && (
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <UserIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
