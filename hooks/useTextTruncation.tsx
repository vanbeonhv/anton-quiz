'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Hook to detect if text content is truncated due to CSS overflow
 * @param text - The text content to check
 * @param deps - Dependencies that should trigger re-checking
 * @returns boolean indicating if text is truncated
 */
export function useTextTruncation<T extends HTMLElement = HTMLElement>(text: string, deps: any[] = []) {
  const [isTruncated, setIsTruncated] = useState(false)
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (!elementRef.current || !text) {
        setIsTruncated(false)
        return
      }

      const element = elementRef.current
      // Check if scrollWidth is greater than clientWidth (indicates truncation)
      const truncated = element.scrollWidth > element.clientWidth
      setIsTruncated(truncated)
    }

    // Check immediately
    checkTruncation()

    // Check on resize
    const resizeObserver = new ResizeObserver(checkTruncation)
    if (elementRef.current) {
      resizeObserver.observe(elementRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [text, ...deps])

  return { isTruncated, elementRef }
}