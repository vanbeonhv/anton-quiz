import React from 'react'

/**
 * Process inline markdown formatting (bold, italic, code) within a single line
 */
function processInlineFormatting(text: string): React.ReactNode[] {
    if (!text) return [text]

    const result: React.ReactNode[] = []
    let currentIndex = 0
    let keyCounter = 0

    while (currentIndex < text.length) {
        let matched = false

        // Try to match **bold**
        if (text.slice(currentIndex, currentIndex + 2) === '**') {
            const endIndex = text.indexOf('**', currentIndex + 2)
            if (endIndex !== -1 && endIndex > currentIndex + 2) {
                const content = text.slice(currentIndex + 2, endIndex)
                result.push(
                    <strong key={keyCounter++} className="font-bold">
                        {content}
                    </strong>
                )
                currentIndex = endIndex + 2
                matched = true
            }
        }

        // Try to match `code`
        if (!matched && text[currentIndex] === '`') {
            const endIndex = text.indexOf('`', currentIndex + 1)
            if (endIndex !== -1 && endIndex > currentIndex + 1) {
                const content = text.slice(currentIndex + 1, endIndex)
                result.push(
                    <code
                        key={keyCounter++}
                        className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                    >
                        {content}
                    </code>
                )
                currentIndex = endIndex + 1
                matched = true
            }
        }

        // Try to match *italic* (avoid matching if preceded/followed by word character)
        if (!matched && text[currentIndex] === '*') {
            const prevChar = currentIndex > 0 ? text[currentIndex - 1] : ' '
            const isPrevWordChar = /\w/.test(prevChar)
            
            if (!isPrevWordChar) {
                const endIndex = text.indexOf('*', currentIndex + 1)
                if (endIndex !== -1 && endIndex > currentIndex + 1) {
                    const nextChar = endIndex + 1 < text.length ? text[endIndex + 1] : ' '
                    const isNextWordChar = /\w/.test(nextChar)
                    const content = text.slice(currentIndex + 1, endIndex)
                    
                    // Ensure content doesn't start with space and next char isn't a word char
                    if (!isNextWordChar && !/^\s/.test(content)) {
                        result.push(
                            <em key={keyCounter++} className="italic">
                                {content}
                            </em>
                        )
                        currentIndex = endIndex + 1
                        matched = true
                    }
                }
            }
        }

        // Try to match _italic_ (avoid matching if preceded/followed by word character)
        if (!matched && text[currentIndex] === '_') {
            const prevChar = currentIndex > 0 ? text[currentIndex - 1] : ' '
            const isPrevWordChar = /\w/.test(prevChar)
            
            if (!isPrevWordChar) {
                const endIndex = text.indexOf('_', currentIndex + 1)
                if (endIndex !== -1 && endIndex > currentIndex + 1) {
                    const nextChar = endIndex + 1 < text.length ? text[endIndex + 1] : ' '
                    const isNextWordChar = /\w/.test(nextChar)
                    const content = text.slice(currentIndex + 1, endIndex)
                    
                    // Ensure content doesn't start with space and next char isn't a word char
                    if (!isNextWordChar && !/^\s/.test(content)) {
                        result.push(
                            <em key={keyCounter++} className="italic">
                                {content}
                            </em>
                        )
                        currentIndex = endIndex + 1
                        matched = true
                    }
                }
            }
        }

        // If no pattern matched, accumulate plain text
        if (!matched) {
            let plainTextEnd = currentIndex + 1
            
            // Find the next potential markdown character
            while (plainTextEnd < text.length) {
                const char = text[plainTextEnd]
                if (char === '*' || char === '_' || char === '`') {
                    break
                }
                plainTextEnd++
            }
            
            result.push(text.slice(currentIndex, plainTextEnd))
            currentIndex = plainTextEnd
        }
    }

    return result
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