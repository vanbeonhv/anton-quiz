interface QuizPageProps {
  params: {
    id: string
  }
}

export default function QuizPage({ params }: QuizPageProps) {
  return (
    <div className="min-h-screen bg-bg-peach">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          Quiz Page - ID: {params.id}
        </h1>
        <p className="text-text-secondary">
          Quiz interface will be implemented in Checkpoint 6
        </p>
      </div>
    </div>
  )
}