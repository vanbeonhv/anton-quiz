interface DailyQuizQuestionProps {
  text: string
}

export function DailyQuizQuestion({ text }: DailyQuizQuestionProps) {
  return (
    <div className="bg-bg-cream rounded-lg border border-bg-peach p-8">
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-2xl">📅</span>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-text-primary text-center mb-6">
        Today&apos;s Challenge
      </h2>
      <p className="text-lg text-text-primary leading-relaxed text-center">
        {text}
      </p>
    </div>
  )
}