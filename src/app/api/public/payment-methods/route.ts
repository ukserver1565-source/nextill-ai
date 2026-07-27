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
  wallet_address: string
  qr_code_url: string
  instructions: string
}

// Only these payment methods are allowed on the public checkout
const ALLOWED_METHODS = new Set(["gopayfast", "stripe"])

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_methods")
      .single()

    if (error) return NextResponse.json([])
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

    // ONLY return allowed, enabled methods (GoPayFast + Stripe)
    const publicMethods = methods
      .filter((m) => m.enabled && ALLOWED_METHODS.has(m.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((m) => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        type: m.type,
        description: m.description,
        sort_order: m.sort_order,
        wallet_address: m.wallet_address || "",
        qr_code_url: m.qr_code_url || "",
        instructions: m.instructions || "",
      }))

    return NextResponse.json(publicMethods)
  } catch {
    return NextResponse.json([])
  }
}
