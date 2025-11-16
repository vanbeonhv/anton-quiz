import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradientBackgroundProps {
  variant: 'hero' | 'feature' | 'cta'
  children: ReactNode
  className?: string
}

export function GradientBackground({ 
  variant, 
  children, 
  className 
}: GradientBackgroundProps) {
  const variantClasses = {
    hero: 'hero-gradient relative overflow-hidden',
    feature: 'feature-gradient relative overflow-hidden',
    cta: 'cta-gradient relative overflow-hidden'
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {/* Decorative background elements */}
      {variant === 'hero' && (
        <>
          {/* Organic blob shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-orange/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-yellow/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
          
          {/* Subtle dot pattern */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
