import { handleToolApi } from "@/lib/services/tool-api-handler"

export async function POST(req: Request) {
  return handleToolApi(req, "summarizer")
}