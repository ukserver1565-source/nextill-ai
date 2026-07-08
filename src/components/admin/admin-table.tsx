"use client"

import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: string
  onRowClick?: (item: T) => void
}

export function AdminTable<T extends Record<string, any>>({ columns, data, keyField, onRowClick }: AdminTableProps<T>) {
  return (
    <div className="-mx-3 sm:-mx-0 overflow-x-auto">
      <div className="inline-block min-w-full align-middle px-3 sm:px-0">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th key={col.key} className={cn("text-left text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap", col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item[keyField]}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-card/50"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("py-2 sm:py-3 px-2 sm:px-3 text-[11px] sm:text-xs", col.className)}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-xs sm:text-sm text-muted">No data found</div>
        )}
      </div>
    </div>
  )
}
