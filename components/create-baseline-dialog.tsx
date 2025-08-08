"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBaseline } from "@/app/server-actions"

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CreateBaselineDialog({ open = false, onOpenChange = () => {} }: Props) {
  const [name, setName] = useState("")
  const [variable, setVariable] = useState("")
  const [minVersion, setMinVersion] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await createBaseline({ name, variable, minVersion })
      onOpenChange(false)
      setName("")
      setVariable("")
      setMinVersion("")
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add baseline</DialogTitle>
          <DialogDescription>Define a minimum version for a variable.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="bname">Name</Label>
            <Input id="bname" value={name} onChange={(e) => setName(e.target.value)} required placeholder="PHP" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bvar">Variable</Label>
            <Input id="bvar" value={variable} onChange={(e) => setVariable(e.target.value)} required placeholder="PHP_Version" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bmin">Min version</Label>
            <Input id="bmin" value={minVersion} onChange={(e) => setMinVersion(e.target.value)} required placeholder="8.3" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
