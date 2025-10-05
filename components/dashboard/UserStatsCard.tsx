import { Award, Target } from 'lucide-react'

interface UserStatsCardProps {
    dailyPoints: number
    questionsSolved: number
}

export function UserStatsCard({ dailyPoints, questionsSolved }: UserStatsCardProps) {
    return (
        <div className="bg-primary-orange rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
                {/* Daily Points */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-orange-light rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-primary-orange" fill="currentColor" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {dailyPoints.toLocaleString()}
                        </div>
                        <div className="text-primary-orange-light text-sm">
                            Daily Points
                        </div>
                    </div>
                </div>

                {/* Questions Solved */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-orange-light rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary-orange" fill="currentColor" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {questionsSolved.toLocaleString()}
                        </div>
                        <div className="text-primary-orange-light text-sm">
                            Questions Solved
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}