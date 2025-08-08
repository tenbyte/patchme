"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const email = emailRef.current?.value
    const password = passRef.current?.value
    if (!email || !password) return
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      router.push("/")
      router.refresh()
    } else {
      setSubmitting(false)
      alert("Login fehlgeschlagen")
    }
  }

  const fillAdmin = () => {
    if (emailRef.current) emailRef.current.value = "admin@patchme.local"
    if (passRef.current) passRef.current.value = "admin123"
    document.getElementById("login-submit")?.focus()
  }
  const fillDemoUser = () => {
    if (emailRef.current) emailRef.current.value = "user@patchme.local"
    if (passRef.current) passRef.current.value = "demo123"
    document.getElementById("login-submit")?.focus()
  }

  return (
    <main className="min-h-screen grid place-items-center bg-background px-4">
      <Card className="w-full max-w-md shadow">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold">PatchMe</span>
          </div>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use any credentials for this demo, or auto-fill below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input ref={emailRef} id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input ref={passRef} id="password" name="password" type="password" required placeholder="••••••••" />
            </div>

            <Button id="login-submit" type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>


            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={fillAdmin} variant="secondary">
                Admin ausfüllen
              </Button>
              <Button type="button" onClick={fillDemoUser} variant="secondary">
                Demo-User ausfüllen
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              This is a demo. Authentication is disabled.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
