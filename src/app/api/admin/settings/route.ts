import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("site_settings").select("*").order("key")
    if (error) {
      console.error("[Settings GET]", error)
      return NextResponse.json({})
    }
    const settings: Record<string, unknown> = {}
    for (const row of (data || [])) {
      if (row && row.key) settings[row.key] = row.value
    }
    return NextResponse.json(settings)
  } catch (err) {
    console.error("[Settings GET]", err)
    return NextResponse.json({})
  }
}

/**
 * Format a value for storage in a jsonb column.
 * PostgREST (Supabase) handles serialization — just pass values as-is.
 * Objects/arrays pass through. Strings pass through.
 * Do NOT JSON.stringify — it double-encodes and adds extra quotes.
 */
function formatJsonValue(value: unknown): unknown {
  if (value === null || value === undefined) return ""
  return value // PostgREST handles jsonb serialization
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const now = new Date().toISOString()

    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: formatJsonValue(value),
      updated_at: now,
    }))

    // Strategy 1: Try upsert (requires unique constraint on key + INSERT policy)
    const { error: upsertError } = await supabaseAdmin
      .from("site_settings")
      .upsert(updates, { onConflict: "key" })

    if (!upsertError) {
      // Success — clear email cache and return
      clearEmailCache()
      return NextResponse.json({ success: true })
    }

    console.warn("[Settings PATCH] Upsert failed, trying individual insert/update:", upsertError.message)

    // Strategy 2: Fallback — check each key individually, insert or update
    let successCount = 0
    let failCount = 0

    for (const row of updates) {
      try {
        // Check if key exists
        const { data: existing } = await supabaseAdmin
          .from("site_settings")
          .select("key")
          .eq("key", row.key)
          .maybeSingle()

        if (existing) {
          // UPDATE existing row
          const { error: updateErr } = await supabaseAdmin
            .from("site_settings")
            .update({ value: row.value, updated_at: now })
            .eq("key", row.key)
          if (updateErr) {
            console.error(`[Settings PATCH] Failed to update "${row.key}":`, updateErr.message)
            failCount++
          } else {
            successCount++
          }
        } else {
          // INSERT new row
          const { error: insertErr } = await supabaseAdmin
            .from("site_settings")
            .insert({ key: row.key, value: row.value, updated_at: now })
          if (insertErr) {
            console.error(`[Settings PATCH] Failed to insert "${row.key}":`, insertErr.message)
            failCount++
          } else {
            successCount++
          }
        }
      } catch (rowErr) {
        console.error(`[Settings PATCH] Error processing "${row.key}":`, rowErr)
        failCount++
      }
    }

    clearEmailCache()

    if (failCount > 0 && successCount === 0) {
      return NextResponse.json(
        { error: "Failed to save settings", details: "All settings failed to save. Check server logs." },
        { status: 500 }
      )
    }

    if (failCount > 0) {
      return NextResponse.json(
        { success: true, warning: `Partially saved: ${successCount} succeeded, ${failCount} failed` }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Settings PATCH]", err)
    return NextResponse.json({ error: "Failed to save settings", details: (err as Error).message }, { status: 500 })
  }
}

function clearEmailCache() {
  try {
    import("@/lib/email").then(emailLib => {
      if (typeof (emailLib as any).clearCache === "function") (emailLib as any).clearCache()
    }).catch(() => {})
  } catch {
    // Email lib may not exist yet — not critical
  }
}
