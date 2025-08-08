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

  return (
    <main className="min-h-screen grid place-items-center bg-background px-4">
      <Card className="w-full max-w-md shadow">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold">PatchMe</span>
          </div>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Please sign in with your credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input ref={emailRef} id="email" name="email" type="email" required placeholder="you@patchme.local" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input ref={passRef} id="password" name="password" type="password" required placeholder="••••••••" />
            </div>
            <Button id="login-submit" type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
