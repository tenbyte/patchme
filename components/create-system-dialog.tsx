"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VariableMultiSelect } from "./variable-multiselect"

export default function CreateSystemDialog({ open = false, onOpenChange = () => {} }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [name, setName] = useState("")
  const [hostname, setHostname] = useState("")
  const [selectedGlobals, setSelectedGlobals] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [globalOptions, setGlobalOptions] = useState<{ id: string; name: string }[]>([])
  const [tagOptions, setTagOptions] = useState<{ id: string; name: string }[]>([])
  const [baselineOptions, setBaselineOptions] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((tags) => setTagOptions(tags))
    fetch("/api/baselines")
      .then((res) => res.json())
      .then((baselines) => setBaselineOptions(baselines))
  }, [])

  const canSubmit = name && hostname && selectedGlobals.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          hostname,
          tags: selectedTags, 
          baselines: selectedGlobals, 
          apiKey: "pm_" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        }),
      })
      onOpenChange(false)
      setName("")
      setHostname("")
      setSelectedGlobals([])
      setSelectedTags([])
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create system</DialogTitle>
          <DialogDescription>An API key is generated automatically. Only selected global variables are accepted via ingest.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="systemName" autoComplete="off" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hostname">Hostname / URL</Label>
              <Input id="hostname" required value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="https://srv01.acme.com" />
            </div>
          </div>

          <VariableMultiSelect
            options={tagOptions.map((t) => t.name)}
            value={selectedTags.map(
              id => tagOptions.find(t => t.id === id)?.name || id
            )}
            onChange={names => setSelectedTags(
              names.map(name => tagOptions.find(t => t.name === name)?.id || name)
            )}
            placeholder="Select tags…"
            label="Tags"
            creatable={false}
          />

          <VariableMultiSelect
            options={baselineOptions.map((b) => b.name)}
            value={selectedGlobals.map(
              id => baselineOptions.find(b => b.id === id)?.name || id
            )}
            onChange={names => setSelectedGlobals(
              names.map(name => baselineOptions.find(b => b.name === name)?.id || name)
            )}
            placeholder="Select baselines…"
            label="Baselines"
            creatable={false}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit || isPending}>{isPending ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
