/**
 * Admin utility functions for checking admin permissions
 */

export function isAdmin(email: string): boolean {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}

export function requireAdmin(email: string): void {
  if (!isAdmin(email)) {
    throw new Error('Admin access required')
  }
}