import React from 'react'

/**
 * Process inline markdown formatting (bold, italic, code) within a single line
 */
function processInlineFormatting(text: string): React.ReactNode[] {
    if (!text) return [text]

    // Split by markdown patterns: **bold**, *italic*, _italic_, `code`
    // Pattern matches bold first (to avoid conflict with italic), then italic, then code
    // For italic with *, require non-space content and no adjacent alphanumeric to avoid math expressions
    // For italic with _, require word boundaries to avoid matching variable_names
    const parts = text.split(/(\*\*[^*]+\*\*|(?<!\w)\*[^\s*][^*]*?\*(?!\w)|(?<!\w)_[^\s_][^_]*?_(?!\w)|`[^`]+`)/g)

    return parts.map((part, index) => {
        // Skip undefined parts from regex groups
        if (part === undefined) return null

        // Handle bold text **text**
        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2)
            return (
                <strong key={index} className="font-bold">
                    {content}
                </strong>
            )
        }

        // Handle italic text *text* or _text_
        if ((part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) ||
            (part.startsWith('_') && part.endsWith('_'))) {
            const content = part.slice(1, -1)
            return (
                <em key={index} className="italic">
                    {content}
                </em>
            )
        }

        // Handle code text `text`
        if (part.startsWith('`') && part.endsWith('`')) {
            const content = part.slice(1, -1)
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
 * Enhanced markdown renderer that supports:
 * - **bold text** -> <strong>bold text</strong>
 * - *italic text* or _italic text_ -> <em>italic text</em>
 * - `code text` -> <code>code text</code>
 * - Line breaks (single newline) -> <br />
 * - Paragraphs (double newline) -> separate <p> elements
 * - Bullet lists (- or *) -> <ul><li> elements
 * - Numbered lists (1., 2., etc.) -> <ol><li> elements
 */
export function renderSimpleMarkdown(text: string): React.ReactNode {
    if (!text) return text

    // Split text into blocks by double newlines (paragraphs)
    const blocks = text.split(/\n\n+/)

    return blocks.map((block, blockIndex) => {
        const lines = block.split('\n')

        // Check if this block is a bullet list
        const isBulletList = lines.every(line => 
            line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim() === ''
        ) && lines.some(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))

        // Check if this block is a numbered list
        const isNumberedList = lines.every(line => 
            /^\d+\.\s/.test(line.trim()) || line.trim() === ''
        ) && lines.some(line => /^\d+\.\s/.test(line.trim()))

        // Render bullet list
        if (isBulletList) {
            const listItems = lines
                .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
                .map((line, index) => {
                    const content = line.trim().slice(2) // Remove '- ' or '* '
                    return (
                        <li key={index}>
                            {processInlineFormatting(content)}
                        </li>
                    )
                })

            return (
                <ul key={blockIndex} className="list-disc list-outside mb-3 space-y-1.5 pl-5">
                    {listItems}
                </ul>
            )
        }

        // Render numbered list
        if (isNumberedList) {
            const listItems = lines
                .filter(line => /^\d+\.\s/.test(line.trim()))
                .map((line, index) => {
                    const content = line.trim().replace(/^\d+\.\s/, '') // Remove '1. ', '2. ', etc.
                    return (
                        <li key={index}>
                            {processInlineFormatting(content)}
                        </li>
                    )
                })

            return (
                <ol key={blockIndex} className="list-decimal list-outside mb-3 space-y-1.5 pl-5">
                    {listItems}
                </ol>
            )
        }

        // Render paragraph with line breaks
        const paragraphContent = lines.map((line, lineIndex) => {
            const processedLine = processInlineFormatting(line)
            
            // Add <br /> between lines, but not after the last line
            if (lineIndex < lines.length - 1) {
                return (
                    <React.Fragment key={lineIndex}>
                        {processedLine}
                        <br />
                    </React.Fragment>
                )
            }
            
            return <React.Fragment key={lineIndex}>{processedLine}</React.Fragment>
        })

        // Wrap in paragraph if there are multiple blocks
        if (blocks.length > 1) {
            return (
                <p key={blockIndex} className="mb-3 last:mb-0">
                    {paragraphContent}
                </p>
            )
        }

        // Single block, no paragraph wrapper needed
        return <React.Fragment key={blockIndex}>{paragraphContent}</React.Fragment>
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