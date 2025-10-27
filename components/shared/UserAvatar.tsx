'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  userEmail: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showBorder?: boolean
}

// Size mappings in pixels
const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
}

// Pleasant color palette for fallback avatars
const avatarColors = [
  '#2D9F7C', // primary-green
  '#F39C6B', // primary-orange
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#EF4444', // red
  '#14B8A6', // teal
]

// Generate consistent color based on email hash
function getColorFromEmail(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

// Get first letter of email for fallback
function getInitialFromEmail(email: string): string {
  return email.charAt(0).toUpperCase()
}

// Determine if background is light or dark for text contrast
function getTextColor(bgColor: string): string {
  // Convert hex to RGB
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? '#2C1810' : '#FFFFFF'
}

export function UserAvatar({
  userEmail,
  avatarUrl,
  size = 'md',
  className,
  showBorder = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(!!avatarUrl)

  const pixelSize = sizeMap[size]
  const bgColor = getColorFromEmail(userEmail)
  const textColor = getTextColor(bgColor)
  const initial = getInitialFromEmail(userEmail)

  // Show fallback if no avatar URL or image failed to load
  const showFallback = !avatarUrl || imageError

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
        showBorder && 'ring-2 ring-white ring-offset-1',
        className
      )}
      style={{
        width: pixelSize,
        height: pixelSize,
      }}
    >
      {showFallback ? (
        // Fallback avatar with first letter
        <div
          className="w-full h-full flex items-center justify-center font-semibold"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : '18px',
          }}
        >
          {initial}
        </div>
      ) : (
        <>
          {/* Loading skeleton */}
          {isLoading && (
            <div
              className="absolute inset-0 bg-bg-peach animate-pulse"
              style={{
                width: pixelSize,
                height: pixelSize,
              }}
            />
          )}
          
          {/* Avatar image */}
          <Image
            src={avatarUrl}
            alt={`${userEmail} avatar`}
            width={pixelSize}
            height={pixelSize}
            className="w-full h-full object-cover"
            onError={() => {
              setImageError(true)
              setIsLoading(false)
            }}
            onLoad={() => setIsLoading(false)}
            unoptimized // For external URLs like GitHub avatars
          />
        </>
      )}
    </div>
  )
}
