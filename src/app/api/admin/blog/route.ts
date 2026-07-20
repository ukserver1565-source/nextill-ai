import { NextRequest, NextResponse } from "next/server"
import { blogRepo } from "@/lib/repositories/blog-repo"
import { paginationSchema, createBlogPostSchema } from "@/lib/validation/admin-schemas"

export async function GET(req: NextRequest) {
  try {
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const data = await blogRepo.list(params)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch blog posts", details: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createBlogPostSchema.parse(body)
    const status = parsed.status || "draft"
    const post = await blogRepo.create({
      title: parsed.title,
      slug: parsed.slug,
      ...(parsed.excerpt ? { excerpt: parsed.excerpt } : {}),
      ...(parsed.content ? { content: parsed.content } : {}),
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
  } catch (err) {
    return NextResponse.json({ error: "Failed to create post", details: (err as Error).message }, { status: 400 })
  }
}
