import { NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"
import { updateUserSchema } from "@/lib/validation/admin-schemas"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await userService.getById(id)
    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ error: "User not found", details: (err as Error).message }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateUserSchema.parse(body)
    const user = await userService.update(id, parsed)
    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user", details: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await userService.delete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete user", details: (err as Error).message }, { status: 500 })
  }
}
