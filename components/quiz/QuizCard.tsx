import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, BookOpen } from 'lucide-react'

interface QuizCardProps {
    id: string
    title: string
    description: string | null
    type: 'NORMAL' | 'DAILY'
    questionCount: number
    attemptCount: number
    onClick: () => void
}

export function QuizCard({
    title,
    description,
    type,
    questionCount,
    attemptCount,
    onClick
}: QuizCardProps) {
    return (
        <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 bg-bg-cream border-bg-peach"
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-semibold text-text-primary line-clamp-2">
                        {title}
                    </CardTitle>
                    {type === 'DAILY' && (
                        <Badge className="bg-primary-orange text-white ml-2 flex-shrink-0">
                            Daily
                        </Badge>
                    )}
                </div>
                {description && (
                    <CardDescription className="text-text-secondary line-clamp-2">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{questionCount} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{attemptCount} attempts</span>
                        </div>
                    </div>

                    {type === 'DAILY' && (
                        <div className="flex items-center gap-1 text-primary-orange">
                            <Clock className="w-4 h-4" />
                            <span>Daily</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}