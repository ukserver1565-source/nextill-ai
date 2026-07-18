import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface PaymentMethod {
  id: string
  name: string
  enabled: boolean
  icon: string
  type: string
  description: string
  sort_order: number
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_methods")
      .single()

    if (error) {
      // Table or key might not exist yet
      return NextResponse.json([])
    }

    if (!data?.value) return NextResponse.json([])

    let methods: PaymentMethod[]
    if (typeof data.value === "string") {
      try {
        methods = JSON.parse(data.value)
      } catch {
        return NextResponse.json([])
      }
    } else {
      methods = data.value
    }

    if (!Array.isArray(methods)) return NextResponse.json([])

    // Return only enabled methods, strip sensitive fields
    const publicMethods = methods
      .filter((m) => m.enabled)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((m) => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        type: m.type,
        description: m.description,
        sort_order: m.sort_order,
      }))

    return NextResponse.json(publicMethods)
  } catch {
    return NextResponse.json([])
  }
}
