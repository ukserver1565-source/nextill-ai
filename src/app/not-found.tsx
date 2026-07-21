import Link from "next/link"
import { Home, Search, BookOpen } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl font-bold gradient-primary-text mb-4">404</div>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-muted mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all">
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link href="/tools" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm font-medium hover:bg-white/[0.06] transition-all">
              <Search className="w-4 h-4" /> Browse Tools
            </Link>
            <Link href="/blog" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm font-medium hover:bg-white/[0.06] transition-all">
              <BookOpen className="w-4 h-4" /> Read Blog
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
