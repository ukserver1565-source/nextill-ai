import { NextResponse } from "next/server"
import { z } from "zod"

const downloadSchema = z.object({
  content: z.string(),
  format: z.enum(["txt", "md", "docx", "pdf"]),
  filename: z.string().default("article"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = downloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { content, format, filename } = parsed.data
    const cleanFilename = filename.replace(/[^a-z0-9-]/gi, "-").toLowerCase()

    const mimeTypes: Record<string, string> = {
      txt: "text/plain",
      md: "text/markdown",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pdf: "application/pdf",
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": mimeTypes[format] || "text/plain",
        "Content-Disposition": `attachment; filename="${cleanFilename}.${format}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
