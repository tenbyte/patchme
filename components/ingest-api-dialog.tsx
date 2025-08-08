"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command } from 'lucide-react'
import type { System } from "@/lib/types"

export default function IngestApiDialog({
  system,
  trigger,
}: {
  system: System
  trigger: React.ReactNode
}) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const entries = system.baselines.map((b) => ({
    variable: b.variable,
    minVersion: b.minVersion,
    current: system.baselineValues?.find((bv) => bv.baselineId === b.id)?.value || null
  }))
  const schema = `POST /api/ingest\nContent-Type: application/json {\n  key: \"${system.apiKey}\",\n  versions: [\n${entries.map(e => `    { variable: \"${e.variable}\", version: \"${e.current || '<version>'}\" }`).join(',\n')}\n  ]\n}`

  const curlBody = {
    key: system.apiKey,
    versions: entries.map(e => ({ variable: e.variable, version: e.current || "<version>" }))
  }
  const curl = `curl -X POST ${baseUrl}/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(curlBody, null, 2)}'`

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="w-4 h-4" />
            Ingest API
            <span className="text-xs text-muted-foreground ml-3">{system.name}</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
          </TabsList>
          <TabsContent value="schema" className="mt-3">
            <div className="text-sm font-mono rounded-md border bg-muted/50 p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap">
              {schema}
            </div>
          </TabsContent>
          <TabsContent value="curl" className="mt-3">
            <div className="text-sm font-mono rounded-md border bg-muted/50 p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap">
              {curl}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
