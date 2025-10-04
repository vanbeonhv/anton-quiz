interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100)
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">
          Progress
        </span>
        <span className="text-sm text-text-muted">
          {current}/{total}
        </span>
      </div>
      
      <div className="w-full h-3 bg-primary-orange-light rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-green rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-center mt-1">
        <span className="text-xs text-text-muted">
          {percentage}% Complete
        </span>
      </div>
    </div>
  )
}