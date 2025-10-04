import React, { useState } from 'react'
import { useDailyQuizCheck } from '@/lib/queries'
import type { OptionKey, QuizForTaking, QuizResults } from '@/types'

export function useDailyQuizLogic() {
    // Check for bypass parameter in development
    const [bypassCheck, setBypassCheck] = useState(false)

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search)
            setBypassCheck(searchParams.get('bypass') === 'true' && process.env.NODE_ENV === 'development')
        }
    }, [])

    const { data: dailyCheck, isLoading: checkLoading, error: checkError } = useDailyQuizCheck()

    const [quiz, setQuiz] = useState<QuizForTaking | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState<QuizResults | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Load quiz when daily check is available or bypassed
    React.useEffect(() => {
        if (bypassCheck && !quiz) {
            // In bypass mode, load the daily quiz directly
            loadDailyQuizDirect()
        } else if (dailyCheck?.canTake && dailyCheck.quizId && !quiz) {
            loadQuiz(dailyCheck.quizId)
        }
    }, [dailyCheck, quiz, bypassCheck]) // eslint-disable-line react-hooks/exhaustive-deps

    const loadDailyQuizDirect = async () => {
        setLoading(true)
        try {
            // Get daily quiz ID first
            const checkRes = await fetch('/api/daily-quiz/check')
            if (checkRes.ok) {
                const checkData = await checkRes.json()
                if (checkData.quizId) {
                    await loadQuiz(checkData.quizId)
                }
            }
        } catch (error) {
            console.error('Failed to load daily quiz:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadQuiz = async (quizId: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/quiz/${quizId}`)
            if (!res.ok) throw new Error('Failed to load quiz')
            const quizData = await res.json()
            setQuiz(quizData)
        } catch (error) {
            console.error('Failed to load quiz:', error)
        } finally {
            setLoading(false)
        }
    }
    const handleSubmit = async () => {
        if (!quiz || !selectedAnswer || submitting) return

        // Get quiz ID from dailyCheck or bypass mode
        const quizId = dailyCheck?.quizId || quiz.id
        if (!quizId) return

        setSubmitting(true)
        try {
            const submitData = {
                answers: [{
                    questionId: quiz.questions[0].id,
                    selectedAnswer: selectedAnswer
                }]
            }

            const submitUrl = bypassCheck
                ? `/api/quiz/${quizId}/submit?bypass=true`
                : `/api/quiz/${quizId}/submit`

            const res = await fetch(submitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to submit answer')
            }

            const result = await res.json()
            setResults(result)
            setSubmitted(true)
        } catch (error) {
            console.error('Submit error:', error)
            alert(error instanceof Error ? error.message : 'Failed to submit answer')
        } finally {
            setSubmitting(false)
        }
    }

    return {
        // State
        bypassCheck,
        dailyCheck,
        checkLoading,
        checkError,
        quiz,
        loading,
        selectedAnswer,
        submitted,
        results,
        submitting,

        // Actions
        setSelectedAnswer,
        handleSubmit
    }
}