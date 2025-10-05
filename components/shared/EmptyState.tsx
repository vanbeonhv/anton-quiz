import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: string | LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon = '📝',
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <div className="text-6xl mb-4" role="img" aria-label="Empty state icon">
          {icon}
        </div>
      )
    } else {
      const IconComponent = icon
      return (
        <div className="mb-4">
          <IconComponent className="w-16 h-16 mx-auto text-text-muted opacity-50" />
        </div>
      )
    }
  }

  return (
    <div className="text-center py-12 px-4">
      {renderIcon()}
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-primary-green hover:bg-primary-green-dark"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}