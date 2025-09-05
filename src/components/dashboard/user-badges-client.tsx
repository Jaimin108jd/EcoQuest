"use client"

import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
    Award,
    Medal,
    Trophy,
    Star,
    Crown,
    Target,
    Zap,
    Shield
} from "lucide-react"

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
}

interface UserBadgesClientProps {
    user: User
}

function BadgeCard({ badge, earned, earnedAt }: { badge: any, earned: boolean, earnedAt?: Date }) {
    const getBadgeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'participation': return Trophy
            case 'waste': return Target
            case 'streak': return Zap
            case 'leadership': return Crown
            case 'achievement': return Star
            default: return Medal
        }
    }

    const Icon = getBadgeIcon(badge.type || 'achievement')

    return (
        <Card className={`transition-all duration-200 ${earned
            ? 'bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border-yellow-400/30 hover:border-yellow-400/50'
            : 'bg-[#020E0E]/40 border-white/10 hover:border-white/20'
            }`}>
            <CardContent className="p-6 text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center border-2 ${earned
                    ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-yellow-400/40'
                    : 'bg-white/5 border-white/20'
                    }`}>
                    <Icon className={`h-10 w-10 ${earned ? 'text-yellow-400' : 'text-white/30'}`} />
                </div>

                <h3 className={`font-semibold mb-2 ${earned ? 'text-yellow-400' : 'text-white/50'}`}>
                    {badge.name}
                </h3>

                <p className={`text-sm mb-4 ${earned ? 'text-white/80' : 'text-white/40'}`}>
                    {badge.description}
                </p>

                {earned ? (
                    <div className="space-y-2">
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                            Earned!
                        </Badge>
                        {earnedAt && (
                            <p className="text-xs text-white/60">
                                Earned on {new Date(earnedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ) : (
                    <Badge variant="outline" className="border-white/20 text-white/50">
                        Not Earned
                    </Badge>
                )}

                {badge.requirement && (
                    <div className="mt-4 text-xs text-white/50 bg-[#020E0E]/50 p-2 rounded">
                        <strong>Requirement:</strong> {badge.requirement}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function UserBadgesClient({ user }: UserBadgesClientProps) {
    const trpc = useTRPC()

    const { data: badgesData, isLoading: badgesLoading } = useQuery({
        ...trpc.badges.getUserBadges.queryOptions(),
    })

    const earnedBadges = badgesData?.earnedBadges || []
    const allBadges = badgesData?.allBadges || []
    const totalEarned = badgesData?.totalEarned || 0
    const totalAvailable = badgesData?.totalAvailable || 0
    const completionPercentage = totalAvailable > 0 ? (totalEarned / totalAvailable) * 100 : 0

    const earnedBadgeIds = new Set(earnedBadges.map((ub: any) => ub.badge.id))

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Achievements</h1>
                    <p className="text-white/70 mt-1">
                        Track your progress and unlock badges
                    </p>
                </div>
            </div>

            {/* Progress Overview */}
            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                        <Award className="h-6 w-6 text-yellow-400" />
                        Your Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">
                                {badgesLoading ? <Skeleton className="h-10 w-16 bg-yellow-400/20 mx-auto" /> : totalEarned}
                            </div>
                            <p className="text-white/70">Badges Earned</p>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">
                                {badgesLoading ? <Skeleton className="h-10 w-16 bg-white/20 mx-auto" /> : totalAvailable}
                            </div>
                            <p className="text-white/70">Total Badges</p>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#01DE82] mb-2">
                                {badgesLoading ? <Skeleton className="h-10 w-16 bg-[#01DE82]/20 mx-auto" /> : `${Math.round(completionPercentage)}%`}
                            </div>
                            <p className="text-white/70">Completion</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/70">Progress</span>
                            <span className="text-yellow-400 font-medium">
                                {totalEarned} / {totalAvailable}
                            </span>
                        </div>
                        <Progress
                            value={completionPercentage}
                            className="h-3 bg-[#020E0E]/50"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Badges Grid */}
            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                <CardHeader>
                    <CardTitle className="text-white text-xl">All Badges</CardTitle>
                </CardHeader>
                <CardContent>
                    {badgesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="bg-[#020E0E]/40 border-white/10">
                                    <CardContent className="p-6 text-center space-y-4">
                                        <Skeleton className="w-20 h-20 rounded-full bg-white/10 mx-auto" />
                                        <Skeleton className="h-6 w-3/4 bg-white/10 mx-auto" />
                                        <Skeleton className="h-4 w-full bg-white/10" />
                                        <Skeleton className="h-6 w-20 bg-white/10 mx-auto" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : allBadges.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield className="h-16 w-16 text-white/30 mx-auto mb-4" />
                            <h3 className="text-white text-xl font-semibold mb-2">No Badges Available</h3>
                            <p className="text-white/50">Badge system will be available soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allBadges.map((badge: any) => {
                                const userBadge = earnedBadges.find((ub: any) => ub.badge.id === badge.id)
                                return (
                                    <BadgeCard
                                        key={badge.id}
                                        badge={badge}
                                        earned={badge.earned}
                                        earnedAt={badge.earnedAt}
                                    />
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
