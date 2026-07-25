import { NextRequest, NextResponse } from "next/server"
import { blogRepo } from "@/lib/repositories/blog-repo"
import { paginationSchema, createBlogPostSchema } from "@/lib/validation/admin-schemas"
import { sanitizeHtml } from "@/lib/security/html-sanitizer"
import { createSupabaseServerClient } from "@/lib/supabase/server"

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { user }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await blogRepo.list(params)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error
    const body = await req.json()
    const parsed = createBlogPostSchema.parse(body)
    const status = parsed.status || "draft"

    // Sanitize content before storing (defense in depth)
    const cleanContent = parsed.content
      ? sanitizeHtml(parsed.content)
      : undefined

    const post = await blogRepo.create({
      title: parsed.title,
      slug: parsed.slug,
      ...(parsed.excerpt ? { excerpt: parsed.excerpt } : {}),
      ...(cleanContent ? { content: cleanContent } : {}),
      ...(parsed.featured_image_url ? { featured_image_url: parsed.featured_image_url } : {}),
      ...(parsed.category_id ? { category_id: parsed.category_id } : {}),
      ...(parsed.author_id ? { author_id: parsed.author_id } : {}),
      status,
      ...(status === "published" && !parsed.published_at ? { published_at: new Date().toISOString() } : {}),
      ...(parsed.published_at ? { published_at: parsed.published_at } : {}),
      ...(parsed.seo_title ? { seo_title: parsed.seo_title } : {}),
      ...(parsed.meta_description ? { meta_description: parsed.meta_description } : {}),
    })
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 400 })
  }
}
