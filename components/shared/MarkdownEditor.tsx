"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MarkdownText } from "@/lib/utils/markdown"

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  label?: string
  id?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter text with markdown formatting...",
  minHeight = "150px",
  label,
  id,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = React.useState<string>("edit")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to switch tabs
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        setActiveTab((current) => (current === "edit" ? "preview" : "edit"))
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus textarea when switching to edit mode
  React.useEffect(() => {
    if (activeTab === "edit" && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [activeTab])

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2" aria-label="Markdown editor modes">
          <TabsTrigger 
            value="edit"
            aria-label="Edit mode - Write markdown text"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger 
            value="preview"
            aria-label="Preview mode - See formatted output"
          >
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent 
          value="edit" 
          className="mt-2"
          role="tabpanel"
          aria-label="Edit mode"
        >
          <Textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono"
            style={{ minHeight }}
            aria-label={label || "Markdown editor"}
            aria-describedby={id ? `${id}-help` : undefined}
          />
          <p 
            id={id ? `${id}-help` : undefined}
            className="text-xs text-muted-foreground mt-2"
          >
            Supports markdown: <strong>**bold**</strong>, <em>*italic*</em>, <code>`code`</code>, lists (- or 1.), and line breaks
          </p>
        </TabsContent>

        <TabsContent 
          value="preview" 
          className="mt-2"
          role="tabpanel"
          aria-label="Preview mode"
        >
          <div
            className="w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-sm"
            style={{ minHeight }}
            aria-live="polite"
            aria-label="Markdown preview"
          >
            {value ? (
              <MarkdownText>{value}</MarkdownText>
            ) : (
              <span className="text-muted-foreground italic">
                No content to preview
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Preview of formatted text
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
