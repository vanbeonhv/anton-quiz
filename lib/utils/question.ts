import { Difficulty } from '@/types'

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'EASY':
      return 'bg-green-100 text-green-800'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800'
    case 'HARD':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export interface QuestionFormData {
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
  difficulty: Difficulty
  tagIds: string[]
}

export function validateQuestionForm(formData: QuestionFormData): string | null {
  if (!formData.text.trim()) return 'Question text is required'
  if (!formData.optionA.trim()) return 'Option A is required'
  if (!formData.optionB.trim()) return 'Option B is required'
  if (!formData.optionC.trim()) return 'Option C is required'
  if (!formData.optionD.trim()) return 'Option D is required'
  return null
}
