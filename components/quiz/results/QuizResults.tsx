import { QuizScoreSummary } from './QuizScoreSummary'
import { QuizQuestionReview } from './QuizQuestionReview'
import { QuizResultsActions } from './QuizResultsActions'
import type { QuestionForTaking, QuizResults as QuizResultsType } from '@/types'

interface Quiz {
  questions: QuestionForTaking[]
}

interface QuizResultsProps {
  quiz: Quiz
  results: QuizResultsType
}

export function QuizResults({ quiz, results }: QuizResultsProps) {
  return (
    <div className="space-y-8">
      <QuizScoreSummary 
        score={results.score} 
        totalQuestions={results.totalQuestions} 
      />

      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const userAnswer = results.answers.find((a) => a.questionId === question.id)
          
          if (!userAnswer) return null

          return (
            <QuizQuestionReview
              key={question.id}
              question={question}
              answer={userAnswer}
              index={index}
              totalQuestions={quiz.questions.length}
            />
          )
        })}
      </div>

      <QuizResultsActions />
    </div>
  )
}