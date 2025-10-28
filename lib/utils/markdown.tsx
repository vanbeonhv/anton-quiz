import React from 'react'

/**
 * Simple markdown renderer that supports:
 * - **bold text** -> <strong>bold text</strong>
 * - `code text` -> <code>code text</code>
 */
export function renderSimpleMarkdown(text: string): React.ReactNode {
    if (!text) return text

    // Split text by markdown patterns while preserving the delimiters
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

    return parts.map((part, index) => {
        // Handle bold text **text**
        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2) // Remove ** from both ends
            return (
                <strong key={index} className="font-bold">
                    {content}
                </strong>
            )
        }

        // Handle code text `text`
        if (part.startsWith('`') && part.endsWith('`')) {
            const content = part.slice(1, -1) // Remove ` from both ends
            return (
                <code
                    key={index}
                    className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                >
                    {content}
                </code>
            )
        }

        // Regular text
        return part
    })
}

/**
 * Component wrapper for rendering markdown text
 */
interface MarkdownTextProps {
    children: string
    className?: string
}

export function MarkdownText({ children, className }: MarkdownTextProps) {
    return (
        <span className={className}>
            {renderSimpleMarkdown(children)}
        </span>
    )
}