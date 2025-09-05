"use client"

import * as motion from "motion/react-client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Trophy,
    Leaf,
    Users,
    Star,
    Gift,
    Calendar,
    TrendingUp,
    Award,
    Recycle,
    MapPin,
    Clock,
    ArrowRight,
    Zap,
    Target,
    Heart,
    MessageCircle,
    Share2
} from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import DashboardHeader from "./dashboard-header"

interface UserDashboardProps {
    user: {
        id: string
        email: string
        kindeId: string
        given_name?: string
        picture?: string
    }
}

// Type definitions for the data
interface DashboardStats {
    level: number
    xp: number
    totalWasteCollected: number
    eventsAttended: number
    totalPoints: number
}

interface EventHistory {
    id: string
    title: string
    date: Date
    location: string
    xpReward: number
}

interface CommunityPost {
    id: string
    content: string
    createdAt: Date
    author: {
        name: string
    }
    likesCount: number
    commentsCount: number
}

interface LeaderboardPlayer {
    id: string
    name: string
    kindeId: string
    totalXP: number
}

interface Badge {
    id: string
    name: string
}

interface Reward {
    id: string
    name: string
    pointsCost: number
}

export default function UserDashboard({ user }: UserDashboardProps) {
    // Fetch dashboard data
    const trpc = useTRPC()

    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        ...trpc.user.getDashboardStats.queryOptions()
    })

    const { data: userBadges, isLoading: badgesLoading } = useQuery({
        ...trpc.user.getBadges.queryOptions()
    })

    const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
        ...trpc.user.getLeaderboard.queryOptions({ limit: 5 })
    })

    const { data: eventHistory, isLoading: eventsLoading } = useQuery({
        ...trpc.user.getEventHistory.queryOptions({ limit: 3 })
    })

    const { data: communityFeed, isLoading: communityLoading } = useQuery({
        ...trpc.community.getFeed.queryOptions({ limit: 3 })
    })

    const { data: availableRewards, isLoading: rewardsLoading } = useQuery({
        ...trpc.rewards.getRewards.queryOptions({ limit: 3 })
    })

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05
            }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    // Calculate level progress
    const currentLevel = dashboardStats?.userXP?.currentLevel || 1
    const currentXP = dashboardStats?.userXP?.totalXP || 0
    const xpForNextLevel = currentLevel * 1000 // Each level requires 1000 more XP
    const progressToNextLevel = ((currentXP % 1000) / 1000) * 100

    return (
        <div className="min-h-screen bg-[#020E0E] relative overflow-hidden">
            {/* Dashboard Header */}
            <DashboardHeader user={user} />

            {/* Background orbs matching home page */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-[#01DE82]/10 to-[#05614B]/5 rounded-full blur-3xl"
                animate={{
                    x: [0, 50, -25, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-[#05614B]/10 to-[#01DE82]/5 rounded-full blur-3xl"
                animate={{
                    x: [0, -60, 30, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            <div className="relative z-10 p-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <motion.h1
                                className="text-4xl md:text-5xl font-bold text-white mb-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Welcome back, <span className="text-[#01DE82]">{user.given_name || "EcoWarrior"}</span>!
                            </motion.h1>
                            <motion.p
                                className="text-white/70 text-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                Continue your environmental impact journey
                            </motion.p>
                        </div>

                        <motion.div
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Avatar className="h-16 w-16 ring-2 ring-[#01DE82]/50">
                                <AvatarImage src={user.picture || ''} alt={user.given_name || ''} />
                                <AvatarFallback className="bg-[#05614B] text-white text-xl">
                                    {user.given_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-right">
                                <div className="text-white font-semibold">Level {currentLevel}</div>
                                <div className="text-[#01DE82]">{currentXP.toLocaleString()} XP</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Level Progress Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <Card className="bg-gradient-to-r from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/80">Progress to Level {currentLevel + 1}</span>
                                <span className="text-[#01DE82] font-semibold">{Math.round(progressToNextLevel)}%</span>
                            </div>
                            <Progress
                                value={progressToNextLevel}
                                className="h-3 bg-[#05614B]/30"
                            />
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Main Dashboard Grid */}
                <motion.div
                    className="grid lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Left Column - Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Stats Cards */}
                        <motion.div
                            className="grid md:grid-cols-3 gap-4"
                            variants={cardVariants}
                        >
                            <Card className="bg-gradient-to-br from-[#01DE82]/15 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/30 p-6 hover:border-[#01DE82]/50 transition-all duration-300 group">
                                <motion.div
                                    className="flex items-center justify-between mb-4"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="p-3 bg-[#01DE82]/20 rounded-full">
                                        <Recycle className="h-6 w-6 text-[#01DE82]" />
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-[#01DE82]/60 group-hover:text-[#01DE82] transition-colors" />
                                </motion.div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {statsLoading ? "..." : `${dashboardStats?.userXP?.totalWasteCollected || 0} kg`}
                                </div>
                                <div className="text-white/60 text-sm">Total Waste Collected</div>
                            </Card>

                            <Card className="bg-gradient-to-br from-[#05614B]/15 to-[#01DE82]/5 backdrop-blur-xl border-[#01DE82]/30 p-6 hover:border-[#01DE82]/50 transition-all duration-300 group">
                                <motion.div
                                    className="flex items-center justify-between mb-4"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="p-3 bg-[#05614B]/20 rounded-full">
                                        <Calendar className="h-6 w-6 text-[#05614B]" />
                                    </div>
                                    <Star className="h-5 w-5 text-[#01DE82]/60 group-hover:text-[#01DE82] transition-colors" />
                                </motion.div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {statsLoading ? "..." : dashboardStats?.userXP?.totalEventsParticipated || 0}
                                </div>
                                <div className="text-white/60 text-sm">Events Attended</div>
                            </Card>

                            <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/10 backdrop-blur-xl border-[#01DE82]/30 p-6 hover:border-[#01DE82]/50 transition-all duration-300 group">
                                <motion.div
                                    className="flex items-center justify-between mb-4"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="p-3 bg-[#01DE82]/20 rounded-full">
                                        <Target className="h-6 w-6 text-[#01DE82]" />
                                    </div>
                                    <Zap className="h-5 w-5 text-[#01DE82]/60 group-hover:text-[#01DE82] transition-colors" />
                                </motion.div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {statsLoading ? "..." : dashboardStats?.participationStats?.totalXPEarned || 0}
                                </div>
                                <div className="text-white/60 text-sm">Total Points Earned</div>
                            </Card>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div variants={cardVariants}>
                            <Card className="bg-gradient-to-br from-[#01DE82]/8 to-[#05614B]/3 backdrop-blur-xl border-[#01DE82]/20 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-[#01DE82]" />
                                        Recent Events
                                    </h3>
                                    <Link href="/events">
                                        <Button variant="ghost" size="sm" className="text-[#01DE82] hover:bg-[#01DE82]/10">
                                            View All <ArrowRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {eventsLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="bg-[#01DE82]/10 h-16 rounded-lg"></div>
                                            </div>
                                        ))
                                    ) : eventHistory?.length ? (
                                        eventHistory.map((event: any, index: number) => (
                                            <motion.div
                                                key={event.id}
                                                className="flex items-center gap-4 p-4 bg-[#01DE82]/5 rounded-lg hover:bg-[#01DE82]/10 transition-colors cursor-pointer"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ x: 5 }}
                                            >
                                                <div className="p-2 bg-[#01DE82]/20 rounded-full">
                                                    <MapPin className="h-4 w-4 text-[#01DE82]" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-white font-medium">{event.title}</div>
                                                    <div className="text-white/60 text-sm">
                                                        {new Date(event.date).toLocaleDateString()} • {event.locationName}
                                                    </div>
                                                </div>
                                                <Badge className="bg-[#01DE82]/20 text-[#01DE82] border-[#01DE82]/30">
                                                    +{event.participation?.xpEarned || 0} XP
                                                </Badge>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-white/60">
                                            <Calendar className="h-12 w-12 mx-auto mb-4 text-[#01DE82]/40" />
                                            <p>No events attended yet. Join your first cleanup event!</p>
                                            <Link href="/events">
                                                <Button className="mt-4 bg-[#01DE82] hover:bg-[#05614B] text-[#020E0E]">
                                                    Browse Events
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Community Feed Preview */}
                        <motion.div variants={cardVariants}>
                            <Card className="bg-gradient-to-br from-[#05614B]/8 to-[#01DE82]/3 backdrop-blur-xl border-[#01DE82]/20 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Users className="h-5 w-5 text-[#01DE82]" />
                                        Community Updates
                                    </h3>
                                    <Link href="/community">
                                        <Button variant="ghost" size="sm" className="text-[#01DE82] hover:bg-[#01DE82]/10">
                                            View Feed <ArrowRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {communityLoading ? (
                                        [...Array(2)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="bg-[#01DE82]/10 h-20 rounded-lg"></div>
                                            </div>
                                        ))
                                    ) : communityFeed?.length ? (
                                        communityFeed.map((post: any, index: number) => (
                                            <motion.div
                                                key={post.id}
                                                className="p-4 bg-[#01DE82]/5 rounded-lg hover:bg-[#01DE82]/10 transition-colors"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-[#05614B] text-white text-xs">
                                                            {post.user.firstName?.charAt(0) || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-white font-medium text-sm">
                                                                {post.user.firstName} {post.user.lastName}
                                                            </span>
                                                            <span className="text-white/40 text-xs">
                                                                {new Date(post.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/80 text-sm mb-3">{post.content}</p>
                                                        <div className="text-white/60 text-xs text-center">
                                                            <span className="flex items-center gap-1">
                                                                <Heart className="h-3 w-3" /> {post._count.likes}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle className="h-3 w-3" /> {post._count.comments}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-white/60">
                                            <Users className="h-10 w-10 mx-auto mb-3 text-[#01DE82]/40" />
                                            <p>Join the community and share your eco journey!</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Leaderboard */}
                        <motion.div variants={cardVariants}>
                            <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-[#01DE82]" />
                                    Leaderboard
                                </h3>

                                <div className="space-y-3">
                                    {leaderboardLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="bg-[#01DE82]/10 h-12 rounded-lg"></div>
                                            </div>
                                        ))
                                    ) : leaderboard?.topByXP?.length ? (
                                        leaderboard.topByXP.map((player: any, index: number) => (
                                            <motion.div
                                                key={player.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg ${player.user.id === parseInt(user.id)
                                                        ? 'bg-[#01DE82]/20 border border-[#01DE82]/40'
                                                        : 'bg-[#01DE82]/5'
                                                    }`}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ x: -5 }}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-black' :
                                                        index === 1 ? 'bg-gray-400 text-black' :
                                                            index === 2 ? 'bg-amber-600 text-white' :
                                                                'bg-[#01DE82]/20 text-[#01DE82]'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-[#05614B] text-white text-xs">
                                                        {player.user.firstName?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="text-white text-sm font-medium">
                                                        {player.user.firstName} {player.user.lastName}
                                                    </div>
                                                    <div className="text-[#01DE82] text-xs">{player.totalXP.toLocaleString()} XP</div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-white/60">
                                            <Trophy className="h-8 w-8 mx-auto mb-2 text-[#01DE82]/40" />
                                            <p className="text-sm">No rankings yet</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Badges/Achievements */}
                        <motion.div variants={cardVariants}>
                            <Card className="bg-gradient-to-br from-[#05614B]/10 to-[#01DE82]/5 backdrop-blur-xl border-[#01DE82]/20 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-[#01DE82]" />
                                    Achievements
                                </h3>

                                <div className="grid grid-cols-3 gap-3">
                                    {badgesLoading ? (
                                        [...Array(6)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="bg-[#01DE82]/10 h-16 rounded-lg"></div>
                                            </div>
                                        ))
                                    ) : userBadges?.earnedBadges?.length ? (
                                        userBadges.earnedBadges.slice(0, 6).map((badge: any, index: number) => (
                                            <motion.div
                                                key={badge.id}
                                                className="flex flex-col items-center p-3 bg-[#01DE82]/10 rounded-lg hover:bg-[#01DE82]/20 transition-colors"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Star className="h-6 w-6 text-[#01DE82] mb-1" />
                                                <span className="text-xs text-white/80 text-center">{badge.name}</span>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center py-4 text-white/60">
                                            <Award className="h-8 w-8 mx-auto mb-2 text-[#01DE82]/40" />
                                            <p className="text-sm">Start earning badges!</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Available Rewards */}
                        <motion.div variants={cardVariants}>
                            <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Gift className="h-5 w-5 text-[#01DE82]" />
                                        Rewards
                                    </h3>
                                    <Link href="/rewards">
                                        <Button variant="ghost" size="sm" className="text-[#01DE82] hover:bg-[#01DE82]/10">
                                            View All
                                        </Button>
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {rewardsLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="bg-[#01DE82]/10 h-16 rounded-lg"></div>
                                            </div>
                                        ))
                                    ) : availableRewards?.length ? (
                                        availableRewards.map((reward, index) => (
                                            <motion.div
                                                key={reward.id}
                                                className="p-3 bg-[#01DE82]/5 rounded-lg hover:bg-[#01DE82]/10 transition-colors"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[#01DE82]/20 rounded-full">
                                                        <Gift className="h-4 w-4 text-[#01DE82]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-white text-sm font-medium">{reward.name}</div>
                                                        <div className="text-[#01DE82] text-xs">{reward.pointsRequired} points</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-white/60">
                                            <Gift className="h-8 w-8 mx-auto mb-2 text-[#01DE82]/40" />
                                            <p className="text-sm">No rewards available</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div variants={cardVariants}>
                            <Card className="bg-gradient-to-br from-[#01DE82]/8 to-[#05614B]/3 backdrop-blur-xl border-[#01DE82]/20 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link href="/events">
                                        <Button className="w-full bg-[#01DE82] hover:bg-[#05614B] text-[#020E0E] justify-start">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Find Events
                                        </Button>
                                    </Link>
                                    <Link href="/community">
                                        <Button variant="outline" className="w-full border-[#01DE82]/30 text-[#01DE82] hover:bg-[#01DE82]/10 justify-start">
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share Progress
                                        </Button>
                                    </Link>
                                    <Link href="/rewards">
                                        <Button variant="outline" className="w-full border-[#01DE82]/30 text-[#01DE82] hover:bg-[#01DE82]/10 justify-start">
                                            <Gift className="h-4 w-4 mr-2" />
                                            Redeem Rewards
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
