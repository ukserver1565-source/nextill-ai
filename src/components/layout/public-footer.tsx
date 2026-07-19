import { SiteLogo } from "@/components/shared/site-logo"

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SiteLogo size="sm" />
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
