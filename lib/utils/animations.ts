/**
 * Utility functions for consistent animations across landing page components
 */

// Animation timing constants
export const ANIMATION_DELAYS = {
  NONE: 0,
  SHORT: 100,
  MEDIUM: 200,
  LONG: 300,
} as const

export const fadeInUp = (isVisible: boolean, delay?: number) => {
  const baseClasses = 'transition-all duration-500'
  const visibleClasses = 'opacity-100 translate-y-0'
  const hiddenClasses = 'opacity-0 translate-y-10'
  
  return {
    className: `${baseClasses} ${isVisible ? visibleClasses : hiddenClasses}`,
    ...(delay && { style: { transitionDelay: `${delay}ms` } })
  }
}

export const fadeIn = (isVisible: boolean, delay?: number) => {
  const baseClasses = 'transition-all duration-500'
  const visibleClasses = 'opacity-100'
  const hiddenClasses = 'opacity-0'
  
  return {
    className: `${baseClasses} ${isVisible ? visibleClasses : hiddenClasses}`,
    ...(delay && { style: { transitionDelay: `${delay}ms` } })
  }
}
