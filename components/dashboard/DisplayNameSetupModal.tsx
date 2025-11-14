'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface DisplayNameSetupModalProps {
  isOpen: boolean
  userId: string
  defaultDisplayName: string
  onSuccess: () => void
}

export function DisplayNameSetupModal({
  isOpen,
  userId,
  defaultDisplayName,
  onSuccess
}: DisplayNameSetupModalProps) {
  const [displayName, setDisplayName] = useState(defaultDisplayName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!displayName.trim()) {
      setError('Display name cannot be empty')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Update Supabase Auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() }
      })

      if (updateError) throw updateError

      // Refresh session to get updated metadata
      await supabase.auth.refreshSession()

      // Call success callback
      onSuccess()
    } catch (err) {
      console.error('Failed to update display name:', err)
      setError(err instanceof Error ? err.message : 'Failed to update display name')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Set Your Display Name
          </DialogTitle>
          <DialogDescription>
            Please choose a display name. This will be visible to other users on leaderboards and throughout the app.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              required
              maxLength={50}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-md text-sm bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Setting Display Name...' : 'Set Display Name'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
