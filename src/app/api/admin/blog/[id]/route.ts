import { NextRequest, NextResponse } from "next/server"
import { blogRepo } from "@/lib/repositories/blog-repo"
import { updateBlogPostSchema } from "@/lib/validation/admin-schemas"
import { sanitizeHtml } from "@/lib/security/html-sanitizer"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const post = await blogRepo.getById(id)
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateBlogPostSchema.parse(body)

    // Sanitize: convert empty strings to null for nullable fields
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (value === "" || value === undefined) continue
      sanitized[key] = value
    }

    // Sanitize content HTML (defense in depth)
    if (sanitized.content && typeof sanitized.content === "string") {
      sanitized.content = sanitizeHtml(sanitized.content)
    }

    // If transitioning to published and no published_at set, set it now
    if (sanitized.status === "published" && !sanitized.published_at) {
      const existing = await blogRepo.getById(id)
      if (!existing.published_at) {
        sanitized.published_at = new Date().toISOString()
      }
    }

    const post = await blogRepo.update(id, sanitized as Partial<import("@/lib/repositories/blog-repo").BlogPostRow>)
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: "Failed to update post" }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await blogRepo.delete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
