import Link from "next/link"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-[#6D5EF5] to-[#8B5CF6] bg-clip-text text-transparent mb-4">404</div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-sm text-muted mb-6">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-light text-black font-semibold text-sm hover:opacity-90 transition-all">
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  )
}
