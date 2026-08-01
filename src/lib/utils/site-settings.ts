/**
 * Unwrap a value stored in site_settings.value (jsonb column).
 *
 * All values are wrapped as { v: <value> } for safe jsonb storage
 * (PostgREST requires objects for jsonb columns, not plain strings).
 *
 * This function also handles legacy corrupted values that have
 * accumulated escaped quotes from the old formatJsonValue bug.
 */
export function unwrapSetting(val: unknown): unknown {
  if (val === null || val === undefined) return ""
  if (typeof val === "object" && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>
    // Handle {v: value} format (canonical)
    if ("v" in obj) return obj.v
    // Handle {value: value} format (legacy)
    if ("value" in obj && Object.keys(obj).length <= 2) return obj.value
  }
  if (typeof val === "string") {
    // Strip accumulated escaped quotes from old bug
    let s = val
    while (s.length > 1 && s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1)
    }
    return s
  }
  return val
}

/** Get a string value from a settings row */
export function unwrapSettingString(val: unknown): string {
  const v = unwrapSetting(val)
  return typeof v === "string" ? v : String(v ?? "")
}

/** Get a boolean value from a settings row */
export function unwrapSettingBool(val: unknown): boolean {
  const v = unwrapSetting(val)
  if (typeof v === "boolean") return v
  if (typeof v === "string") return v === "true" || v === "1"
  return false
}

/** Get a number value from a settings row */
export function unwrapSettingNumber(val: unknown): number {
  const v = unwrapSetting(val)
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  return 0
}

/** Get a JSON-parsed value (for arrays/objects stored in settings) */
export function unwrapSettingJson<T = unknown>(val: unknown): T | null {
  const v = unwrapSetting(val)
  if (v === null || v === undefined) return null
  if (typeof v === "object") return v as T
  if (typeof v === "string") {
    try { return JSON.parse(v) as T } catch { return null }
  }
  return null
}
