import { Star, Trophy } from 'lucide-react'

interface UserStatsCardProps {
    expPoints: number
    ranking: number
}

export function UserStatsCard({ expPoints, ranking }: UserStatsCardProps) {
    return (
        <div className="bg-primary-orange rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
                {/* Exp Points */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-orange-light rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-primary-orange" fill="currentColor" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {expPoints.toLocaleString()}
                        </div>
                        <div className="text-primary-orange-light text-sm">
                            Exp. Points
                        </div>
                    </div>
                </div>

                {/* Ranking */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-orange-light rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-primary-orange" fill="currentColor" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {ranking}
                        </div>
                        <div className="text-primary-orange-light text-sm">
                            Ranking
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}