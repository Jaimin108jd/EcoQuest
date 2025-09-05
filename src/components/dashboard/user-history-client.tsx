"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Activity,
    Trophy,
    Calendar,
    MapPin,
    Target,
    Search,
    TrendingUp,
    Award,
    Clock,
    Eye,
    ExternalLink
} from "lucide-react"
import Link from "next/link"

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
}

interface UserHistoryClientProps {
    user: User
}

function ActivityCard({ activity }: { activity: any }) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'PARTICIPATION': return Trophy
            case 'REGISTRATION': return Calendar
            case 'BADGE_EARNED': return Award
            default: return Activity
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'PARTICIPATION': return 'text-green-400 bg-green-400/10 border-green-400/20'
            case 'REGISTRATION': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            case 'BADGE_EARNED': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
            default: return 'text-[#01DE82] bg-[#01DE82]/10 border-[#01DE82]/20'
        }
    }

    const Icon = getActivityIcon(activity.type)
    const colorClasses = getActivityColor(activity.type)

    return (
        <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-200">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${colorClasses} border`}>
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium line-clamp-1">
                                {activity.description}
                            </h3>
                            <div className="flex items-center gap-2">
                                {activity.xpEarned && (
                                    <Badge className="bg-[#01DE82]/20 text-[#01DE82] border-[#01DE82]/30">
                                        +{activity.xpEarned} XP
                                    </Badge>
                                )}
                                {activity.event && (
                                    <Link href={`/events/${activity.event.id}`}>
                                        <Button size="sm" variant="ghost" className="text-[#01DE82] hover:bg-[#01DE82]/10 h-6 px-2">
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            {activity.event && (
                                <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <Calendar className="h-3 w-3" />
                                    <span>{activity.event.title}</span>
                                </div>
                            )}

                            {activity.wasteCollectedKg && (
                                <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <Target className="h-3 w-3" />
                                    <span>{activity.wasteCollectedKg}kg waste collected</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-white/50 text-xs">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(activity.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function PointsHistoryCard({ entry }: { entry: any }) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    const isPositive = entry.points > 0

    return (
        <Card className="bg-[#020E0E]/40 backdrop-blur-xl border-[#01DE82]/10">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-white text-sm font-medium line-clamp-1">
                            {entry.reason}
                        </p>
                        <p className="text-white/50 text-xs mt-1">
                            {formatDate(entry.createdAt)}
                        </p>
                    </div>
                    <Badge className={isPositive
                        ? "bg-green-400/20 text-green-400 border-green-400/30"
                        : "bg-red-400/20 text-red-400 border-red-400/30"
                    }>
                        {isPositive ? '+' : ''}{entry.points} XP
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}

export function UserHistoryClient({ user }: UserHistoryClientProps) {
    const [activeTab, setActiveTab] = useState("activities")
    const [searchQuery, setSearchQuery] = useState("")

    const trpc = useTRPC()

    const { data: userStats, isLoading: statsLoading } = useQuery({
        ...trpc.userStats.getStats.queryOptions(),
    })

    const { data: pointsHistory = [], isLoading: pointsLoading } = useQuery({
        ...trpc.userStats.getPointsHistory.queryOptions({
            limit: 50
        }),
    })

    const activities = userStats?.recentActivities || []

    const filteredActivities = activities.filter((activity: any) => {
        if (!searchQuery) return true
        return activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (activity.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    })

    const pointsHistoryArray = Array.isArray(pointsHistory) ? pointsHistory : pointsHistory?.history || []
    const filteredPointsHistory = pointsHistoryArray.filter((entry: any) => {
        if (!searchQuery) return true
        return entry.reason.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const totalXP = userStats?.userXP?.totalXP || 0
    const currentLevel = userStats?.userXP?.currentLevel || 1
    const totalParticipations = userStats?.participationStats?.totalParticipations || 0

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Activity History</h1>
                    <p className="text-white/70 mt-1">
                        Track your participation and progress over time
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/30">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-[#01DE82]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-6 w-6 text-[#01DE82]" />
                        </div>
                        <div className="text-3xl font-bold text-[#01DE82] mb-2">
                            {statsLoading ? <Skeleton className="h-8 w-16 bg-[#01DE82]/20 mx-auto" /> : totalXP}
                        </div>
                        <p className="text-white/70">Total XP Earned</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-yellow-400/30">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                            {statsLoading ? <Skeleton className="h-8 w-16 bg-yellow-400/20 mx-auto" /> : currentLevel}
                        </div>
                        <p className="text-white/70">Current Level</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-green-400/30">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-green-400 mb-2">
                            {statsLoading ? <Skeleton className="h-8 w-16 bg-green-400/20 mx-auto" /> : totalParticipations}
                        </div>
                        <p className="text-white/70">Events Participated</p>
                    </CardContent>
                </Card>
            </div>

            {/* History Content */}
            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                <CardHeader>
                    <CardTitle className="text-white text-xl">Your History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-[#020E0E]/50 border-[#01DE82]/30 text-white"
                        />
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-[#020E0E]/50 border border-[#01DE82]/20">
                            <TabsTrigger
                                value="activities"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white"
                            >
                                Recent Activities
                            </TabsTrigger>
                            <TabsTrigger
                                value="points"
                                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white"
                            >
                                Points History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="activities" className="mt-6">
                            {statsLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Card key={i} className="bg-[#020E0E]/40 border-[#01DE82]/10">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <Skeleton className="w-11 h-11 rounded-full bg-[#01DE82]/20" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-3/4 bg-[#01DE82]/20" />
                                                        <Skeleton className="h-3 w-1/2 bg-[#01DE82]/20" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : filteredActivities.length === 0 ? (
                                <div className="text-center py-12">
                                    <Activity className="h-16 w-16 text-white/30 mx-auto mb-4" />
                                    <h3 className="text-white text-xl font-semibold mb-2">
                                        {searchQuery ? "No matching activities" : "No activities yet"}
                                    </h3>
                                    <p className="text-white/50">
                                        {searchQuery ? "Try adjusting your search" : "Participate in events to see your activity history"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredActivities.map((activity: any, index: number) => (
                                        <ActivityCard key={activity.id || index} activity={activity} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="points" className="mt-6">
                            {pointsLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <Card key={i} className="bg-[#020E0E]/40 border-[#01DE82]/10">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-3/4 bg-[#01DE82]/20" />
                                                        <Skeleton className="h-3 w-1/3 bg-[#01DE82]/20" />
                                                    </div>
                                                    <Skeleton className="h-6 w-16 bg-[#01DE82]/20" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : filteredPointsHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <TrendingUp className="h-16 w-16 text-white/30 mx-auto mb-4" />
                                    <h3 className="text-white text-xl font-semibold mb-2">
                                        {searchQuery ? "No matching points history" : "No points history yet"}
                                    </h3>
                                    <p className="text-white/50">
                                        {searchQuery ? "Try adjusting your search" : "Earn XP by participating in events"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredPointsHistory.map((entry: any) => (
                                        <PointsHistoryCard key={entry.id} entry={entry} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
