'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-bg-white border-b border-bg-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold text-text-primary">
              QuizApp
            </h1>
          </Link>

          {/* Navigation placeholder */}
          <nav className="flex items-center space-x-4">
            <div className="text-text-secondary">
              Navigation coming soon...
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}