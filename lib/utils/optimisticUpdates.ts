import { QuestionWithTags, UserStats, Tag, TagWithStats, OptionKey } from '@/types'

/**
 * Creates an optimistic user attempt for a question
 */
export function createOptimisticAttempt(questionId: string, selectedAnswer: OptionKey) {
  return {
    id: 'optimistic-' + Date.now(),
    questionId,
    userId: 'current-user',
    userEmail: 'current-user@example.com',
    selectedAnswer,
    isCorrect: false, // Will be updated based on correct answer
    answeredAt: new Date()
  }
}

/**
 * Updates user stats optimistically after a question attempt
 */
export function updateUserStatsOptimistically(
  currentStats: UserStats,
  question: QuestionWithTags,
  selectedAnswer: OptionKey
): UserStats {
  const isCorrect = selectedAnswer === question.correctAnswer
  const difficultyKey = question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
  
  return {
    ...currentStats,
    totalQuestionsAnswered: currentStats.totalQuestionsAnswered + 1,
    totalCorrectAnswers: currentStats.totalCorrectAnswers + (isCorrect ? 1 : 0),
    [`${difficultyKey}QuestionsAnswered`]: (currentStats as any)[`${difficultyKey}QuestionsAnswered`] + 1,
    [`${difficultyKey}CorrectAnswers`]: (currentStats as any)[`${difficultyKey}CorrectAnswers`] + (isCorrect ? 1 : 0),
    currentStreak: isCorrect ? currentStats.currentStreak + 1 : 0,
    longestStreak: isCorrect 
      ? Math.max(currentStats.longestStreak, currentStats.currentStreak + 1) 
      : currentStats.longestStreak,
    lastAnsweredDate: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Updates question tags optimistically for bulk operations
 */
export function updateQuestionTagsOptimistically(
  question: QuestionWithTags,
  tagIds: string[],
  action: 'add' | 'remove' | 'replace',
  allTags: Tag[]
): QuestionWithTags {
  let updatedTags = [...question.tags]
  
  if (action === 'add') {
    // Add tags that aren't already present
    const tagsToAdd = tagIds.filter(tagId => 
      !updatedTags.some(tag => tag.id === tagId)
    )
    const newTags = tagsToAdd.map(tagId => {
      const existingTag = allTags.find(tag => tag.id === tagId)
      return existingTag || {
        id: tagId,
        name: `Tag ${tagId}`,
        createdAt: new Date()
      }
    })
    updatedTags = [...updatedTags, ...newTags]
  } else if (action === 'remove') {
    // Remove specified tags
    updatedTags = updatedTags.filter(tag => !tagIds.includes(tag.id))
  } else if (action === 'replace') {
    // Replace all tags with specified ones
    updatedTags = tagIds.map(tagId => {
      const existingTag = allTags.find(tag => tag.id === tagId)
      return existingTag || {
        id: tagId,
        name: `Tag ${tagId}`,
        createdAt: new Date()
      }
    })
  }

  return {
    ...question,
    tags: updatedTags
  }
}

/**
 * Updates tag stats optimistically after bulk operations
 */
export function updateTagStatsOptimistically(
  tagStats: TagWithStats[],
  tagIds: string[],
  questionCount: number,
  action: 'add' | 'remove' | 'replace'
): TagWithStats[] {
  return tagStats.map(tag => {
    if (tagIds.includes(tag.id)) {
      let questionCountChange = 0
      
      if (action === 'add') {
        questionCountChange = questionCount
      } else if (action === 'remove') {
        questionCountChange = -questionCount
      }
      // For 'replace', the change is more complex and depends on existing state
      // We'll let the server handle the accurate count for replace operations
      
      return {
        ...tag,
        questionCount: Math.max(0, tag.questionCount + questionCountChange)
      }
    }
    return tag
  })
}

/**
 * Rollback helper that restores previous query data
 */
export function rollbackQueryData(
  queryClient: any,
  rollbackData: Array<{ queryKey: any[], data: any }>
) {
  rollbackData.forEach(({ queryKey, data }) => {
    if (data !== undefined) {
      queryClient.setQueryData(queryKey, data)
    }
  })
}