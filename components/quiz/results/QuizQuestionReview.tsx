import { QuestionCard } from '@/components/quiz/QuestionCard'
import { AnswerOption } from '@/components/quiz/AnswerOption'
import type { OptionKey, QuestionForTaking, QuizResultAnswer } from '@/types'

interface QuizQuestionReviewProps {
  question: QuestionForTaking
  answer: QuizResultAnswer
  index: number
  totalQuestions: number
}

export function QuizQuestionReview({
  question,
  answer,
  index,
  totalQuestions
}: QuizQuestionReviewProps) {
  return (
    <div className="space-y-4">
      <QuestionCard
        question={question.text}
        currentIndex={index}
        totalQuestions={totalQuestions}
      />

      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as OptionKey[]).map((option) => (
          <AnswerOption
            key={option}
            label={option}
            text={question[`option${option}` as keyof QuestionForTaking] as string}
            selected={false}
            showResult={true}
            isCorrect={option === answer.question.correctAnswer}
            isUserAnswer={option === answer.selectedAnswer}
            onClick={() => { }}
          />
        ))}
      </div>

      {answer.question.explanation && (
        <div className="bg-primary-green-light border border-primary-green rounded-lg p-4">
          <h4 className="font-semibold text-primary-green-dark mb-2">
            Explanation:
          </h4>
          <p className="text-text-secondary">
            {answer.question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}