import Link from "next/link"
import { Info } from "lucide-react"

export function LegacyBanner({ toolName, targetRoute }: { toolName: string; targetRoute: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
        <Info className="w-4 h-4 shrink-0" />
        <span>
          <strong>{toolName}</strong> now runs inside the{" "}
          <Link href={targetRoute} className="underline hover:text-amber-300 font-medium">Post Generator workflow</Link>.
        </span>
      </div>
    </div>
  )
}
