import Link from "next/link"
import { SiteLogo } from "@/components/shared/site-logo"

const footerLinks = [
  { label: "Features", href: "/features" },
  { label: "Tools", href: "/tools" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
]

export function PublicFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SiteLogo size="sm" />
          <nav className="flex items-center gap-4">
            {footerLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
