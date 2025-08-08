import type { System } from "@/lib/types"

export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .trim()
      .replace(/^v/i, "")
      .split(/[.+-]/)
      .map((x) => Number.parseInt(x.replace(/\D/g, ""), 10) || 0)
  const pa = parse(a)
  const pb = parse(b)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

export function getStatusForSystem(s: System, baselines: { variable: string; minVersion: string }[]): "Ok" | "Warning" {
  for (const b of baselines) {
    if (!s.baselines.some((bl) => bl.variable === b.variable)) continue
  }
  return "Ok"
}
