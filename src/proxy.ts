import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const toolRoutes = [
  "/ai-writer", "/ai-humanizer", "/ai-detector", "/plagiarism-checker",
  "/seo-title-generator", "/meta-description-generator", "/keyword-research",
  "/website-audit", "/rank-tracker", "/backlink-checker",
  "/schema-generator", "/sitemap-generator", "/robots-txt-generator",
  "/internal-link-generator", "/content-brief", "/topical-map",
  "/faq-generator", "/article-rewriter", "/grammar-checker",
  "/summarizer", "/translator",
]
const guestAccessible = new Set(["/", "/tools", "/login", "/signup", "/admin/login", "/reset-password", "/unauthorized", "/pricing", "/contact", "/terms", "/privacy-policy", "/affiliate"])
const userRoutes = ["/dashboard"]
const adminRoutes = ["/admin"]
const adminApiRoutes = ["/api/admin"]

const isDev = process.env.NODE_ENV === "development"

function debug(...args: unknown[]) { if (isDev) console.log("[MIDDLEWARE]", ...args) }

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (toolRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) return NextResponse.next()
  if (pathname.startsWith("/api/tools")) return NextResponse.next()

  if (adminApiRoutes.some((r) => pathname.startsWith(r))) {
    const { supabase, response } = _createClient(request)
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
    const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
    if (!role || (role !== "admin" && role !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return response
  }

  const { supabase, response } = _createClient(request)
  const { data: { user }, error: userErr } = await supabase.auth.getUser()

  if (userErr || !user) {
    debug("no user, pathname:", pathname)
    if (guestAccessible.has(pathname)) return NextResponse.next()
    if (userRoutes.some((r) => pathname.startsWith(r))) {
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
    if (adminRoutes.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    return response
  }

  debug("user authenticated:", user.email)

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const role = ((profile as { role?: string } | null)?.role || "").toLowerCase()
  debug("role:", role)

  if (!role) {
    if (guestAccessible.has(pathname)) return NextResponse.next()
    return response
  }

  const isAdmin = role === "admin" || role === "super_admin"

  if (pathname === "/login" || pathname === "/signup") {
    const dest = isAdmin ? "/admin" : "/dashboard"
    debug("redirect from login to:", dest)
    return NextResponse.redirect(new URL(dest, request.url))
  }

  if (pathname === "/admin/login") {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url))
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  if (userRoutes.some((r) => pathname.startsWith(r))) {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url))
    return response
  }

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isAdmin) return NextResponse.redirect(new URL("/unauthorized", request.url))
    return response
  }

  return response
}

function _createClient(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )
  return { supabase, response }
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }
