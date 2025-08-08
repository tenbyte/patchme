"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command } from 'lucide-react'
import type { System } from "@/lib/types"

export default function IngestApiDialog({
  system,
  trigger,
  baseUrl = "https://your-app.example",
}: {
  system: System
  trigger: React.ReactNode
  baseUrl?: string
}) {
  // allowedVariables und variables gibt es nicht mehr im System!
  // Wir zeigen stattdessen die Baselines an
  const entries = system.baselines.map((b) => ({ variable: b.variable, minVersion: b.minVersion }))

  // Beispiel für das Schema (angepasst)
  const schema = `POST /api/ingest
  Content-Type: application/json {
    systemId: "${system.id}",
    baselines: [${system.baselines.map((b) => `"${b.variable}"`).join(", ")}]
  }`

  const curlBody = { key: system.apiKey, entries }
  const curl = `curl -X POST ${baseUrl}/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(curlBody, null, 2)}'`

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="w-4 h-4" /> Ingest API
            <span className="ml-auto text-xs text-muted-foreground">{system.name}</span>
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
