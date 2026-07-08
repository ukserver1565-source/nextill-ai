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
      ...parsed,
      content: parsed.content ?? null,
      seo_title: parsed.seo_title ?? null,
      meta_description: parsed.meta_description ?? null,
      image_url: parsed.image_url ?? null,
    })
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create post", details: (err as Error).message }, { status: 400 })
  }
}
