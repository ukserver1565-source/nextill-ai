import Link from "next/link"
import { SiteLogo } from "@/components/shared/site-logo"

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Service Policy", href: "/service-policy" },
    ],
  },
]

export function PublicFooter() {
  return (
    <footer className="liquid-glass border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <SiteLogo size="md" className="mb-4" />
            <p className="text-xs text-muted leading-relaxed max-w-xs">
              AI-powered SEO and content tools for modern creators.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-dark mb-4">{col.title}</h2>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted mb-3">
            &copy; {new Date().getFullYear()} Nextill AI. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>Faisalabad, Punjab, Pakistan</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>+92 319 0244898</span>
            <span className="hidden sm:inline text-border">|</span>
            <a href="mailto:support@nextill.ai" className="hover:text-foreground transition-colors">support@nextill.ai</a>
            <span className="hidden sm:inline text-border">|</span>
            <span>Mon - Fri, 9:00 AM - 6:00 PM (PKT)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
