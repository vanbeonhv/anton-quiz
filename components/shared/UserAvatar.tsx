'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  userEmail: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  rank?: number
}

// Size mappings in pixels
const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 80, // For profile pages
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
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? '#2C1810' : '#FFFFFF'
}

// Get font size based on avatar size
function getFontSize(size: 'sm' | 'md' | 'lg' | 'xl'): string {
  switch (size) {
    case 'sm': return '12px'
    case 'md': return '14px'
    case 'lg': return '18px'
    case 'xl': return '32px'
    default: return '14px'
  }
}

export function UserAvatar({
  userEmail,
  avatarUrl,
  size = 'md',
  className,
  showBorder = false,
  rank,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(!!avatarUrl)

  const pixelSize = sizeMap[size]
  const bgColor = getColorFromEmail(userEmail)
  const textColor = getTextColor(bgColor)
  const initial = getInitialFromEmail(userEmail)
  const fontSize = getFontSize(size)

  // Show fallback if no avatar URL or image failed to load
  const showFallback = !avatarUrl || imageError

  // Determine if this is a top rank that needs special styling
  const isFirstPlace = rank === 1
  const isTopThree = rank && rank <= 3

  // For 1st place: animated gradient border wrapper
  if (isFirstPlace) {
    return (
      <div className="relative flex-shrink-0">
        {/* Animated gradient border wrapper */}
        <div
          className="rounded-full animate-rotate-gradient p-[3px]"
          style={{
            background: 'conic-gradient(from 0deg, #FFD700, #FFBF00, #FFD166, #FFA500, #FFD700)',
            width: pixelSize + 6,
            height: pixelSize + 6,
          }}
        >
          {/* Avatar content */}
          <div
            className={cn(
              'relative flex items-center justify-center rounded-full overflow-hidden bg-bg-cream',
              className
            )}
            style={{
              width: pixelSize,
              height: pixelSize,
            }}
          >
            {showFallback ? (
              <div
                className="w-full h-full flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  fontSize,
                }}
              >
                {initial}
              </div>
            ) : (
              <>
                {isLoading && (
                  <div
                    className="absolute inset-0 bg-bg-peach animate-pulse rounded-full"
                    style={{
                      width: pixelSize,
                      height: pixelSize,
                    }}
                  />
                )}

                <Image
                  src={avatarUrl}
                  alt={`${userEmail} avatar`}
                  width={pixelSize}
                  height={pixelSize}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => {
                    setImageError(true)
                    setIsLoading(false)
                  }}
                  onLoad={() => setIsLoading(false)}
                  unoptimized
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For 2nd-3rd place: enhanced gradient borders
  if (isTopThree) {
    const borderGradient = rank === 2
      ? 'linear-gradient(135deg, #E8E8E8, #C0C0C0, #A8A8A8, #C0C0C0, #E8E8E8)' // Enhanced silver gradient
      : 'linear-gradient(135deg, #D2691E, #CD7F32, #B8860B, #CD7F32, #D2691E)' // Enhanced bronze gradient

    const animationClass = 'animate-pulse-subtle'

    return (
      <div className="relative flex-shrink-0">
        <div
          className={`rounded-full p-[3px] ${animationClass}`}
          style={{
            background: borderGradient,
            width: pixelSize + 6,
            height: pixelSize + 6,
            boxShadow: rank === 2
              ? '0 0 8px rgba(192, 192, 192, 0.4)' // Silver glow
              : '0 0 8px rgba(205, 127, 50, 0.4)', // Bronze glow
          }}
        >
          <div
            className={cn(
              'relative flex items-center justify-center rounded-full overflow-hidden bg-bg-cream',
              className
            )}
            style={{
              width: pixelSize,
              height: pixelSize,
            }}
          >
            {showFallback ? (
              <div
                className="w-full h-full flex items-center justify-center font-semibold"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  fontSize,
                }}
              >
                {initial}
              </div>
            ) : (
              <>
                {isLoading && (
                  <div
                    className="absolute inset-0 bg-bg-peach animate-pulse rounded-full"
                    style={{
                      width: pixelSize,
                      height: pixelSize,
                    }}
                  />
                )}

                <Image
                  src={avatarUrl}
                  alt={`${userEmail} avatar`}
                  width={pixelSize}
                  height={pixelSize}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => {
                    setImageError(true)
                    setIsLoading(false)
                  }}
                  onLoad={() => setIsLoading(false)}
                  unoptimized
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For regular users: standard avatar
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
            fontSize,
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