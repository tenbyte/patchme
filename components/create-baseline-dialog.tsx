"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBaseline } from "@/lib/baseline"
import type { Baseline } from "@/lib/types"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

async function apiCreateBaseline({ name, variable, type, minVersion }: { name: string; variable: string; type: string; minVersion: string }) {
  const res = await fetch("/api/baselines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, variable, type, minVersion }),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to create baseline")
  }
  return res.json()
}

async function apiUpdateBaseline({ id, name, variable, type, minVersion }: { id: string; name: string; variable: string; type: string; minVersion: string }) {
  const res = await fetch(`/api/baselines?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, variable, type, minVersion }),
  })
  if (!res.ok) throw new Error("Failed to update baseline")
  return res.json()
}

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  editBaseline?: Baseline | null
}

export default function CreateBaselineDialog({ open = false, onOpenChange = () => {}, editBaseline = null }: Props) {
  const [name, setName] = useState("")
  const [variable, setVariable] = useState("")
  const [type, setType] = useState("MIN")
  const [minVersion, setMinVersion] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Setze Werte wenn editBaseline sich ändert
  useEffect(() => {
    if (editBaseline) {
      setName(editBaseline.name)
      setVariable(editBaseline.variable)
      setType(editBaseline.type || "MIN")
      setMinVersion(editBaseline.minVersion)
    } else {
      setName("")
      setVariable("")
      setType("MIN")
      setMinVersion("")
    }
    setError(null)
  }, [editBaseline])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const versionValue = type === "INFO" ? "" : minVersion
        if (editBaseline) {
          await apiUpdateBaseline({ id: editBaseline.id, name, variable, type, minVersion: versionValue })
          toast.success("Baseline updated", { id: "baseline-toast" })
        } else {
          await apiCreateBaseline({ name, variable, type, minVersion: versionValue })
          toast.success("Baseline created", { id: "baseline-toast" })
        }
        onOpenChange(false)
        router.refresh()
      } catch (err: any) {
        setError(err.message)
        toast.error(err.message, { id: "baseline-toast" })
      }
    })
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    if (newType === "INFO") {
      setMinVersion("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editBaseline ? "Edit baseline" : "Add baseline"}</DialogTitle>
          <DialogDescription>Define a minimum version for a variable.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="bname">Name</Label>
            <Input id="bname" name="baselineName" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} required placeholder="PHP" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bvar">Variable</Label>
            <Input id="bvar" name="baselineVariable" autoComplete="off" value={variable} onChange={(e) => setVariable(e.target.value)} required placeholder="PHP_Version" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="btype">Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MIN">MIN - Minimum version required</SelectItem>
                <SelectItem value="MAX">MAX - Maximum version allowed</SelectItem>
                <SelectItem value="INFO">INFO - Information only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type !== "INFO" && (
            <div className="grid gap-2">
              <Label htmlFor="bmin">{type === "MAX" ? "Max version" : "Min version"}</Label>
              <Input id="bmin" name="baselineMinVersion" autoComplete="off" value={minVersion} onChange={(e) => setMinVersion(e.target.value)} required placeholder="8.3" />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      </DialogContent>
    </Dialog>
  )
}
