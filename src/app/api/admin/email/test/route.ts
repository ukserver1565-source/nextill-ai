import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest) {
  return NextResponse.json({ success: true, message: "Test email sent (no SMTP configured in dev)" })
}
