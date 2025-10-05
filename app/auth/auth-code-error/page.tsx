import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-bg-peach flex items-center justify-center">
      <div className="max-w-md w-full bg-bg-cream rounded-lg border border-bg-peach p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Authentication Error
          </h1>
          <p className="text-text-secondary">
            There was an error during the authentication process. Please try signing in again.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link href="/login">
            <Button className="w-full bg-primary-green hover:bg-primary-green-dark">
              Try Again
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}