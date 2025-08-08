import BaselinesTable from "@/components/baselines-table"
import { getBaselines } from "@/lib/baseline"

export const dynamic = "force-dynamic"

export default async function BaselinesPage() {
  const baselines = await getBaselines()
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <BaselinesTable baselines={baselines} />
      </div>
    </main>
  )
}
