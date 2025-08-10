"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Command, Copy } from 'lucide-react'
import type { System } from "@/lib/types"
import { useState } from "react"

export default function IngestApiDialog({
  system,
  trigger,
}: {
  system: System
  trigger: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)
  
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const entries = system.baselines.map((b) => ({
    variable: b.variable,
    minVersion: b.minVersion,
    current: system.baselineValues?.find((bv) => bv.baselineId === b.id)?.value || null
  }))
  
  // Korrigiertes JSON Schema mit Anführungszeichen
  const schema = `POST /api/ingest
Content-Type: application/json

{
  "key": "${system.apiKey}",
  "versions": [
${entries.map(e => `    { "variable": "${e.variable}", "version": "${e.current || '<version>'}" }`).join(',\n')}
  ]
}`

  const curlBody = {
    key: system.apiKey,
    versions: entries.map(e => ({ variable: e.variable, version: e.current || "<version>" }))
  }
  const curl = `curl -X POST ${baseUrl}/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(curlBody, null, 2)}'`

  // Activate command
  const activateCommand = `curl -fsSL https://github.com/tenbyte/patchme/raw/main/examples/debian/activate.sh | sudo bash`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="w-4 h-4" />
            Ingest API
            <span className="text-xs text-muted-foreground ml-3">{system.name}</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="activate">Activate</TabsTrigger>
          </TabsList>
          <TabsContent value="schema" className="mt-3">
            <div className="relative">
              <div className="text-sm font-mono rounded-md border bg-muted/50 p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap break-all">
                {schema}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(schema)}
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="curl" className="mt-3">
            <div className="relative">
              <div className="text-sm font-mono rounded-md border bg-muted/50 p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap break-all">
                {curl}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(curl)}
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="activate" className="mt-3">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Run this command on your Debian/Ubuntu system to automatically download and install the systemd timer and service files:
              </div>
              <div className="relative">
                <div className="text-sm font-mono rounded-md border bg-muted/50 p-3 overflow-auto whitespace-pre-wrap break-all">
                  {activateCommand}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(activateCommand)}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                This will download the systemd files from the PatchMe repository and configure automatic version reporting.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
