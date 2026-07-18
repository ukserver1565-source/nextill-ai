import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const { user_id, amount, reason } = await req.json()

    if (!user_id || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "user_id and positive amount are required" }, { status: 400 })
    }

    // Verify user exists in profiles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", user_id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get current balance from credits table (single source of truth)
    const { data: creditRow } = await supabaseAdmin
      .from("credits")
      .select("balance")
      .eq("user_id", user_id)
      .single()

    const currentBalance = creditRow?.balance || 0

    // Add credits via RPC (updates credits table balance)
    const { error: rpcError } = await supabaseAdmin
      .rpc("add_credits", { p_user_id: user_id, p_amount: amount })

    if (rpcError) {
      console.error("add_credits RPC error:", rpcError)
      // Fallback: direct upsert into credits table
      const { error: upsertErr } = await supabaseAdmin
        .from("credits")
        .upsert(
          { user_id, balance: currentBalance + amount },
          { onConflict: "user_id" }
        )
      if (upsertErr) {
        return NextResponse.json({ error: "Failed to add credits", details: upsertErr.message }, { status: 500 })
      }
    }

    // The database trigger will auto-sync profiles.credits from credits.balance
    // No need to write to profiles.credits directly

    // Create credit_logs entry
    try {
      await supabaseAdmin.from("credit_logs").insert({
        user_id,
        amount,
        type: "added",
        reason: reason || "Admin credit adjustment",
      })
    } catch (logErr) {
      console.error("credit_logs insert error:", logErr)
    }

    return NextResponse.json({
      success: true,
      message: `Added ${amount} credits to user`,
      newBalance: currentBalance + amount,
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to add credits", details: (err as Error).message }, { status: 500 })
  }
}
