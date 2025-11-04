import { Zap, CheckCircle, Star } from 'lucide-react'
import { LevelBadge } from '@/components/shared/LevelBadge'

interface UserStatsCardProps {
    dailyPoints: number
    questionsSolved: number
    currentLevel: number
    currentTitle: string
    totalXp: number
}

export function UserStatsCard({ 
    dailyPoints, 
    questionsSolved, 
    currentLevel = 1, 
    currentTitle = "Newbie", 
    totalXp = 0 
}: UserStatsCardProps) {
    return (
        <div className="bg-primary-orange rounded-2xl p-6 text-white shadow-lg">
            {/* Level Badge */}
            <div className="flex justify-between items-start mb-4">
                <LevelBadge 
                    level={currentLevel} 
                    title={currentTitle} 
                    size="md"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30 cursor-pointer"
                    variant='clickable'
                />
                <div className="flex items-center gap-1 text-primary-orange-light">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">{totalXp.toLocaleString()} XP</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                {/* Daily Points */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-orange-light rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary-orange" />
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
                        <CheckCircle className="w-6 h-6 text-primary-orange" />
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