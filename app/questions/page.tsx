'use client'

import { QuestionBrowser } from '@/components/questions/QuestionBrowser'
import { useQuestionFilters } from '@/hooks/useQuestionFilters'

export default function QuestionsPage() {
  const { filters, setFilters } = useQuestionFilters()

  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Practice Questions
          </h1>
          <p className="text-text-secondary">
            Browse and solve questions by topic, difficulty, and more
          </p>
        </div>

        {/* Question Browser Component */}
        <QuestionBrowser
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </div>
  )
}