import { NextRequest, NextResponse } from "next/server"
import { blogRepo } from "@/lib/repositories/blog-repo"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const post = await blogRepo.getPublishedBySlug(slug)
    return NextResponse.json(post)
  } catch (_err) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }
}
