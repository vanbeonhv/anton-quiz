import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnswerOptionProps {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
  selected: boolean
  showResult?: boolean
  isCorrect?: boolean
  isUserAnswer?: boolean
  onClick: () => void
}

export function AnswerOption({
  label,
  text,
  selected,
  showResult = false,
  isCorrect = false,
  isUserAnswer = false,
  onClick
}: AnswerOptionProps) {
  const getButtonStyles = () => {
    if (showResult) {
      if (isCorrect) {
        return 'border-primary-green bg-primary-green text-white'
      }
      if (isUserAnswer && !isCorrect) {
        return 'border-primary-orange bg-primary-orange text-white'
      }
      return 'border-bg-peach bg-bg-cream text-text-secondary'
    }
    
    if (selected) {
      return 'border-primary-green bg-primary-green text-white'
    }
    
    return 'border-bg-peach bg-bg-cream text-text-primary hover:border-primary-orange'
  }

  const getIcon = () => {
    if (!showResult) return null
    
    if (isCorrect) {
      return <Check className="w-5 h-5 ml-auto flex-shrink-0" />
    }
    
    if (isUserAnswer && !isCorrect) {
      return <X className="w-5 h-5 ml-auto flex-shrink-0" />
    }
    
    return null
  }

  return (
    <button
      onClick={onClick}
      disabled={showResult}
      className={cn(
        'w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-3',
        getButtonStyles(),
        showResult ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
      )}
    >
      {/* Option Label */}
      <div className={cn(
        'w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold flex-shrink-0',
        showResult && isCorrect 
          ? 'border-white bg-white text-primary-green'
          : showResult && isUserAnswer && !isCorrect
          ? 'border-white bg-white text-primary-orange'
          : selected
          ? 'border-white bg-white text-primary-green'
          : 'border-current'
      )}>
        {label}
      </div>
      
      {/* Option Text */}
      <span className="flex-1 font-medium">
        {text}
      </span>
      
      {/* Result Icon */}
      {getIcon()}
    </button>
  )
}