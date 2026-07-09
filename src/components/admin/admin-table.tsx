"use client"

import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react"

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: string
  onRowClick?: (item: T) => void
  onSort?: (key: string) => void
  sortKey?: string
  sortDir?: "asc" | "desc"
  loading?: boolean
  emptyMessage?: string
}

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-3">
          <div className="h-4 bg-white/[0.04] rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function AdminTable<T extends Record<string, any>>({
  columns, data, keyField, onRowClick, onSort, sortKey, sortDir, loading, emptyMessage = "No data found",
}: AdminTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111827]/50 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-white/[0.03] border-b border-white/[0.06]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#A7B0C0] py-3 px-3 whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-white transition-colors",
                    col.className
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="inline-flex flex-col">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="w-3 h-3 text-[#6D5EF5]" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-[#6D5EF5]" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 text-[#A7B0C0]/40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={columns.length} />)
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#A7B0C0]">
                    <Search className="w-8 h-8 opacity-30" />
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item[keyField]}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "border-b border-white/[0.03] transition-colors",
                    idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]",
                    onRowClick && "cursor-pointer",
                    "hover:bg-white/[0.03]"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("py-3 px-3 text-[11px] sm:text-xs text-white", col.className)}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
