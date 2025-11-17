'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    
    const toggleVisibility = () => {
      // Throttle scroll events for better performance
      if (timeoutId) return
      
      timeoutId = setTimeout(() => {
        // Show button when page is scrolled down 300px
        setIsVisible(window.scrollY > 300)
        timeoutId = null
      }, 100)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50
        p-3 rounded-full
        bg-primary-green text-white
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        hover:scale-110 hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
