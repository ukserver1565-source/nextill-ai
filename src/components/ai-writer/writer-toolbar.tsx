"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, Copy, Download, Check } from "lucide-react"
import type { DownloadFormat } from "@/lib/ai/output"

interface WriterToolbarProps {
  onUndo?: () => void
  onRedo?: () => void
  onCopy: () => void
  onDownload: (format: DownloadFormat) => void
  canUndo: boolean
  canRedo: boolean
  hasContent: boolean
}

export function WriterToolbar({ onUndo, onRedo, onCopy, onDownload, canUndo, canRedo, hasContent }: WriterToolbarProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null)

  const handleCopy = async () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (fmt: DownloadFormat) => {
    setDownloading(fmt)
    onDownload(fmt)
    setTimeout(() => setDownloading(null), 1500)
  }

  return (
    <div className="flex items-center gap-1 p-1.5 border-b border-border/50 bg-background/50 overflow-x-auto">
      {onUndo && (
        <Button variant="ghost" size="icon-sm" onClick={onUndo} disabled={!canUndo} title="Undo">
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
      )}
      {onRedo && (
        <Button variant="ghost" size="icon-sm" onClick={onRedo} disabled={!canRedo} title="Redo">
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
      )}
      {(onUndo || onRedo) && <div className="w-px h-5 bg-border mx-1" />}

      {hasContent && (
        <>
          <Button variant="ghost" size="icon-sm" onClick={handleCopy} title="Copy to clipboard">
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>

          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" onClick={() => handleDownload("txt")} disabled={!!downloading} title="Download TXT">
              {downloading === "txt" ? <Check className="w-3.5 h-3.5 text-success" /> : <Download className="w-3.5 h-3.5" />}
              <span className="text-[9px] ml-0.5 hidden xs:inline">TXT</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleDownload("md")} disabled={!!downloading} title="Download Markdown">
              {downloading === "md" ? <Check className="w-3.5 h-3.5 text-success" /> : <Download className="w-3.5 h-3.5" />}
              <span className="text-[9px] ml-0.5 hidden xs:inline">MD</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleDownload("docx")} disabled={!!downloading} title="Download DOCX">
              {downloading === "docx" ? <Check className="w-3.5 h-3.5 text-success" /> : <Download className="w-3.5 h-3.5" />}
              <span className="text-[9px] ml-0.5 hidden xs:inline">DOCX</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleDownload("pdf")} disabled={!!downloading} title="Download PDF">
              {downloading === "pdf" ? <Check className="w-3.5 h-3.5 text-success" /> : <Download className="w-3.5 h-3.5" />}
              <span className="text-[9px] ml-0.5 hidden xs:inline">PDF</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
