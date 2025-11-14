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
    hero: 'hero-gradient',
    feature: 'feature-gradient',
    cta: 'cta-gradient'
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  )
}
