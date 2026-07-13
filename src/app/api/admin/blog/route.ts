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
    const post = await blogRepo.create({
      title: parsed.title,
      slug: parsed.slug,
      ...(parsed as any).excerpt ? { excerpt: (parsed as any).excerpt } : {},
      ...(parsed as any).content ? { content: (parsed as any).content } : {},
      ...(parsed as any).category_id ? { category_id: (parsed as any).category_id } : {},
      status: (parsed as any).status || "draft",
      ...(parsed as any).seo_title ? { seo_title: (parsed as any).seo_title } : {},
      ...(parsed as any).meta_description ? { meta_description: (parsed as any).meta_description } : {},
    })
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create post", details: (err as Error).message }, { status: 400 })
  }
}
