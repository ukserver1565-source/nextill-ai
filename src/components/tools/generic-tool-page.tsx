"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth/AuthProvider"
import { getTool } from "@/lib/tools/registry"
import { ToolLayout, FieldLabel, SelectField, RangeField, NumberField, ErrorBox } from "@/components/tools/tool-layout"
import { ToolResult } from "@/components/tools/tool-result"
import { ToolActions } from "@/components/tools/tool-actions"
import { Input } from "@/components/ui/input"
import type { ToolField } from "@/lib/tools/registry"

interface GenericToolPageProps {
  slug: string
}

export function GenericToolPage({ slug }: GenericToolPageProps) {
  const { profile } = useAuth()
  const definition = getTool(slug)

  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
    if (!definition) return {}
    const vals: Record<string, unknown> = {}
    for (const field of definition.fields) {
      vals[field.key] = field.default ?? (field.type === "number" || field.type === "range" ? field.min ?? 0 : "")
    }
    for (const setting of definition.settings || []) {
      vals[`_${setting.key}`] = setting.default
    }
    return vals
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | Record<string, unknown> | null>(null)
  const [resultType, setResultType] = useState<string>("")
  const [error, setError] = useState("")
  const [wordCount, setWordCount] = useState(0)

  if (!definition) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Tool not found: {slug}</p>
      </div>
    )
  }

  const updateField = (key: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError("")
    setResult(null)
    setWordCount(0)

    try {
      const input: Record<string, unknown> = {}
      const settings: Record<string, unknown> = {}

      for (const [key, val] of Object.entries(formValues)) {
        if (key.startsWith("_")) {
          settings[key.slice(1)] = val
        } else {
          input[key] = val
        }
      }

      const res = await fetch(definition.apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, settings }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Request failed")
        if (data.details) console.error(data.details)
        return
      }

      setResult(data.content)
      setResultType(data.type || "")
      setWordCount(data.wordCount || 0)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [formValues, definition])

  const handleClear = useCallback(() => {
    setResult(null)
    setError("")
    setWordCount(0)
  }, [])

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!profile || !result) return false
    try {
      const contentText = typeof result === "string" ? result : JSON.stringify(result, null, 2)
      const topic = (formValues.topic || formValues.text || formValues.seed || formValues.url || formValues.domain || slug) as string
      const res = await fetch("/api/tools/ai-writer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(topic).substring(0, 200),
          content: contentText,
          toolSlug: slug,
        }),
      })
      const data = await res.json()
      return res.ok && data.success
    } catch {
      return false
    }
  }, [profile, result, formValues, slug])

  const requiredFields = definition.fields.filter(f => f.required)
  const isDisabled = loading || requiredFields.some(f => !formValues[f.key] || String(formValues[f.key]).trim() === "")

  const renderField = (field: ToolField) => {
    const value = formValues[field.key] ?? ""

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={value as string}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={5}
            className="flex w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 resize-none"
          />
        )
      case "select":
        return (
          <SelectField
            value={value as string}
            onChange={(v) => updateField(field.key, v)}
            options={field.options || []}
          />
        )
      case "range":
        return (
          <RangeField
            value={value as number}
            onChange={(v) => updateField(field.key, v)}
            min={field.min ?? 0}
            max={field.max ?? 100}
          />
        )
      case "number":
        return (
          <NumberField
            value={value as number}
            onChange={(v) => updateField(field.key, v)}
            min={field.min}
            max={field.max}
          />
        )
      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => updateField(field.key, e.target.value)}
          />
        )
    }
  }

  const handleClearAll = useCallback(() => {
    handleClear()
    setFormValues(() => {
      if (!definition) return {}
      const vals: Record<string, unknown> = {}
      for (const field of definition.fields) {
        vals[field.key] = field.default ?? (field.type === "number" || field.type === "range" ? field.min ?? 0 : "")
      }
      for (const setting of definition.settings || []) {
        vals[`_${setting.key}`] = setting.default
      }
      return vals
    })
  }, [definition, handleClear])

  return (
    <ToolLayout
      title={definition.name}
      description={definition.description}
      creditsCost={definition.creditsCost}
      guestLimit={definition.guestLimit}
      result={
        <div className="space-y-4">
          {error && <ErrorBox message={error} />}

          <ToolResult
            title={resultType ? `${definition.name} - ${resultType}` : definition.name}
            resultType={resultType}
            result={result}
            wordCount={wordCount}
            loading={loading}
            onSave={profile && result ? handleSave : undefined}
            onClear={result ? handleClearAll : undefined}
          />
        </div>
      }
    >
      <div className="space-y-4">
        {definition.fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <FieldLabel>
              {field.label}
              {field.required && <span className="text-danger ml-0.5">*</span>}
            </FieldLabel>
            {renderField(field)}
          </div>
        ))}

        <ToolActions
          onGenerate={handleGenerate}
          onClear={result ? handleClear : undefined}
          loading={loading}
          disabled={isDisabled}
          loadingText="Processing..."
        />
      </div>
    </ToolLayout>
  )
}
