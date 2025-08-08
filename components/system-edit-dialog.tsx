"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { VariableMultiSelect } from "./variable-multiselect"
import type { System } from "@/lib/types"


export default function SystemEditDialog({
  system,
  trigger,
}: {
  system: System
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(system.name)
  const [hostname, setHostname] = useState(system.hostname)
  const [selectedBaselines, setSelectedBaselines] = useState<string[]>(system.baselines.map((b) => b.id))
  const [selectedTags, setSelectedTags] = useState<string[]>(system.tags.map((t) => t.id))
  const [baselineOptions, setBaselineOptions] = useState<{ id: string; name: string }[]>([])
  const [tagOptions, setTagOptions] = useState<{ id: string; name: string }[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((tags) => setTagOptions(tags))
    fetch("/api/baselines")
      .then((res) => res.json())
      .then((baselines) => setBaselineOptions(baselines))
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await fetch(`/api/systems?id=${system.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          hostname,
          tags: selectedTags,
          baselines: selectedBaselines,
        }),
      })
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit system</DialogTitle>
          <DialogDescription>Edit the basics, tags, and allowed global variables.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hostname">Hostname / URL</Label>
              <Input id="hostname" required value={hostname} onChange={(e) => setHostname(e.target.value)} />
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
            value={selectedBaselines.map(
              id => baselineOptions.find(b => b.id === id)?.name || id
            )}
            onChange={names => setSelectedBaselines(
              names.map(name => baselineOptions.find(b => b.name === name)?.id || name)
            )}
            creatable={false}
            placeholder="Select baselines…"
            label="Baselines"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
