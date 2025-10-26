import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function LoadingOverlay({
  isLoading,
  children,
  loadingText = "Loading...",
  className = ""
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-white/80 flex items-center justify-center z-10"
          aria-label="Loading overlay"
          role="status"
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2 
              className="w-8 h-8 animate-spin text-primary-green" 
              aria-label="Loading"
            />
            <span className="text-sm text-text-secondary sr-only">
              {loadingText}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}