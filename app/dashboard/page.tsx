export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to QuizApp
          </h1>
          <p className="text-text-secondary">
            Choose a quiz to test your knowledge
          </p>
        </div>

        {/* Placeholder for quiz cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-bg-cream rounded-lg shadow-sm border border-bg-peach p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Quiz cards will appear here
            </h3>
            <p className="text-text-secondary">
              After we setup the database and components
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}