"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, RefreshCw } from 'lucide-react'
import { useState, useTransition } from "react"

export default function SystemApiKeyDialog({
  systemId,
  currentKey,
  trigger,
}: {
  systemId: string
  currentKey: string
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState(currentKey)
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const onRotate = () => {
    if (!confirm("Rotate API key? The old key becomes invalid immediately.")) return
    startTransition(async () => {
      const res = await fetch(`/api/systems?id=${systemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotateKey: true }),
      })
      if (res.ok) {
        const data = await res.json()
        setApiKey(data.apiKey)
      }
    })
  }

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // noop
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API key</DialogTitle>
          <DialogDescription>Use this key for POST /api/ingest.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={apiKey} />
          <Button type="button" variant="outline" size="icon" onClick={copyKey} aria-label="Copy API key">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">Format: pm_XXXXXXX. Keep the key secret.</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={onRotate} disabled={isPending}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {isPending ? "Rotating..." : "Rotate key"}
          </Button>
        </DialogFooter>
        {copied && <div className="text-xs text-emerald-600 dark:text-emerald-400">Copied</div>}
      </DialogContent>
    </Dialog>
  )
}
