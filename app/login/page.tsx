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
  const [error, setError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    const email = emailRef.current?.value
    const password = passRef.current?.value
    
    if (!email || !password) {
      setError("Email and password are required")
      setSubmitting(false)
      return
    }
    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      })
      
      if (res.ok) {
        console.log("Login successful, redirecting to homepage...")
        router.push("/")
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({ message: "Login failed" }))
        setError(data.message || "Login failed")
        setSubmitting(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Connection error. Please try again later.")
      setSubmitting(false)
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
            {error && (
              <div className="bg-red-50 text-red-500 p-2 rounded border border-red-200 text-sm">
                {error}
              </div>
            )}
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
