import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Monthly credit renewal endpoint
// Call this via cron service (cron-job.org, GitHub Actions, etc.)
// Or trigger manually from admin panel
//
// Usage: POST /api/cron/credits/renew
// Header: x-cron-secret: <CRON_SECRET>
// Optional: { "user_id": "specific-user-uuid" } to renew a single user

export async function POST(req: Request) {
  // Verify cron secret
  const cronSecret = req.headers.get("x-cron-secret")
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 })
  }

  if (cronSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = supabaseAdmin
  const body = await req.json().catch(() => ({}))
  const specificUserId = body.user_id as string | undefined

  try {
    // Get all active users with active subscriptions
    let query = supabase
      .from("profiles")
      .select("user_id, plan")
      .not("plan", "is", null)

    if (specificUserId) {
      query = query.eq("user_id", specificUserId)
    }

    const { data: users, error: fetchError } = await query

    if (fetchError) {
      return NextResponse.json({ error: `Fetch error: ${fetchError.message}` }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users to renew", renewed: 0 })
    }

    // Renew credits for each user
    let renewed = 0
    let failed = 0
    const errors: string[] = []

    for (const user of users) {
      try {
        const { error: renewError } = await supabase.rpc("monthly_credit_renewal", {
          p_user_id: user.user_id,
        })

        if (renewError) {
          failed++
          errors.push(`${user.user_id}: ${renewError.message}`)
        } else {
          renewed++
        }
      } catch {
        failed++
        errors.push(`${user.user_id}: Exception during renewal`)
      }
    }

    return NextResponse.json({
      message: `Credit renewal complete. ${renewed} succeeded, ${failed} failed.`,
      renewed,
      failed,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    )
  }
}

// GET endpoint — also triggers renewal (Vercel cron sends GET)
// Vercel cron adds Authorization: Bearer <CRON_SECRET> header
export async function GET(req: Request) {
  // Verify cron secret (Vercel sends it as Authorization: Bearer)
  const authHeader = req.headers.get("authorization")
  const cronSecret = authHeader?.replace("Bearer ", "") || req.headers.get("x-cron-secret")
  const expectedSecret = process.env.CRON_SECRET

  if (!expectedSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 })
  }

  if (cronSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = supabaseAdmin

  try {
    const { data: users, error: fetchError } = await supabase
      .from("profiles")
      .select("user_id, plan")
      .not("plan", "is", null)

    if (fetchError) {
      return NextResponse.json({ error: `Fetch error: ${fetchError.message}` }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users to renew", renewed: 0 })
    }

    let renewed = 0
    let failed = 0
    const errors: string[] = []

    for (const user of users) {
      try {
        const { error: renewError } = await supabase.rpc("monthly_credit_renewal", {
          p_user_id: user.user_id,
        })
        if (renewError) {
          failed++
          errors.push(`${user.user_id}: ${renewError.message}`)
        } else {
          renewed++
        }
      } catch {
        failed++
        errors.push(`${user.user_id}: Exception`)
      }
    }

    return NextResponse.json({
      message: `Credit renewal complete. ${renewed} succeeded, ${failed} failed.`,
      renewed,
      failed,
      total: users.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    )
  }
}
