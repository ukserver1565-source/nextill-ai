import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { unwrapSettingJson } from "@/lib/utils/site-settings"

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

// Sensible defaults used when the site_settings row is missing or unparseable,
// so the checkout is never left with zero payment methods.
const DEFAULT_METHODS: PaymentMethod[] = [
  {
    id: "gopayfast",
    name: "GoPayFast (Cards / JazzCash / EasyPaisa / Raast)",
    enabled: true,
    icon: "credit-card",
    type: "card",
    description: "Pay via GoPayFast — credit/debit cards, JazzCash, EasyPaisa, UPaisa, Raast and bank transfer.",
    sort_order: 1,
    wallet_address: "",
    qr_code_url: "",
    instructions: "You will be redirected to GoPayFast to complete your payment securely.",
  },
  {
    id: "stripe",
    name: "Stripe (Credit / Debit Card)",
    enabled: true,
    icon: "credit-card",
    type: "card",
    description: "Pay securely with credit or debit cards via Stripe.",
    sort_order: 2,
    wallet_address: "",
    qr_code_url: "",
    instructions: "Enter your card details to pay securely via Stripe.",
  },
]

function toPublic(methods: PaymentMethod[]) {
  return methods
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
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_methods")
      .single()

    if (error) return NextResponse.json(toPublic(DEFAULT_METHODS))
    if (!data?.value) return NextResponse.json(toPublic(DEFAULT_METHODS))

    const unwrapped = unwrapSettingJson<PaymentMethod[]>(data.value)
    if (!unwrapped || !Array.isArray(unwrapped) || unwrapped.length === 0) {
      return NextResponse.json(toPublic(DEFAULT_METHODS))
    }

    // ONLY return allowed, enabled methods (GoPayFast + Stripe)
    return NextResponse.json(toPublic(unwrapped))
  } catch {
    return NextResponse.json(toPublic(DEFAULT_METHODS))
  }
}
