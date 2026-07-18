import Link from "next/link"
import { Sparkles } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold gradient-primary-text">Nextill AI</span>
          </Link>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
