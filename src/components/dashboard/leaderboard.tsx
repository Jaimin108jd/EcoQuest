"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Crown, Medal, Star, TrendingUp, Calendar, Clock } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

type Period = "weekly" | "monthly" | "all-time"

interface LeaderboardEntry {
    rank: number
    user: {
        id: number
        firstName: string
        lastName: string
        email: string
        picture?: string
    }
    totalXP: number
    level: number
    xpInCurrentLevel: number
    xpToNextLevel: number
}

function getRankIcon(rank: number) {
    switch (rank) {
        case 1:
            return <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
        case 2:
            return <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
        case 3:
            return <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
        default:
            return <span className="text-sm sm:text-lg font-bold text-[#01DE82]">#{rank}</span>
    }
}

function getRankBadgeColor(rank: number) {
    switch (rank) {
        case 1:
            return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black"
        case 2:
            return "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
        case 3:
            return "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
        default:
            return "bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E]"
    }
}

function getRankTextColor(rank: number) {
    switch (rank) {
        case 1:
            return "text-yellow-400"
        case 2:
            return "text-gray-300"
        case 3:
            return "text-amber-500"
        default:
            return "text-[#01DE82]"
    }
}

function LeaderboardEntry({ entry, index, isCurrentUser, isEmpty = false }: { 
    entry?: LeaderboardEntry
    index: number
    isCurrentUser: boolean 
    isEmpty?: boolean
}) {
    if (isEmpty || !entry) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 rounded-lg bg-transparent border border-white/5"
            >
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <span className="text-lg sm:text-xl font-bold text-white/20 w-8 sm:w-12 text-center">#{index + 1}</span>
                    <span className="font-medium text-sm sm:text-base text-white/20">---</span>
                </div>
                <div className="flex items-center space-x-4 sm:space-x-6 text-right">
                    <span className="text-xs sm:text-sm text-white/20 min-w-[70px] sm:min-w-[90px]">Level --</span>
                    <span className="text-xs sm:text-sm text-white/20 min-w-[60px] sm:min-w-[80px] text-right">-- XP</span>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all duration-300 hover:bg-[#01DE82]/8 ${
                isCurrentUser ? 'bg-[#01DE82]/15 border border-[#01DE82]/40' : 'bg-transparent border border-white/5 hover:border-[#01DE82]/30'
            }`}
            whileHover={{ scale: 1.01, x: 3 }}
        >
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="w-8 sm:w-12 flex justify-center flex-shrink-0">
                    {getRankIcon(entry.rank)}
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <span className={`font-semibold text-sm sm:text-lg truncate ${isCurrentUser ? 'text-[#01DE82]' : 'text-white'}`}>
                        {entry.user.firstName} {entry.user.lastName}
                    </span>
                    {isCurrentUser && (
                        <span className="text-xs bg-[#01DE82] text-[#020E0E] px-2 py-1 rounded-full font-bold flex-shrink-0">
                            You
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6 text-right flex-shrink-0">
                <span className={`text-xs sm:text-sm font-semibold min-w-[70px] sm:min-w-[90px] ${getRankTextColor(entry.rank)}`}>
                    Level {entry.level}
                </span>
                <span className="text-xs sm:text-sm text-white/80 min-w-[60px] sm:min-w-[80px] text-right font-medium">
                    {entry.totalXP.toLocaleString()} XP
                </span>
            </div>
        </motion.div>
    )
}

function PeriodIcon({ period }: { period: Period }) {
    switch (period) {
        case "weekly":
            return <Calendar className="h-4 w-4" />
        case "monthly":
            return <Clock className="h-4 w-4" />
        case "all-time":
            return <TrendingUp className="h-4 w-4" />
        default:
            return <Star className="h-4 w-4" />
    }
}

export function Leaderboard() {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("all-time")
    const trpc = useTRPC()

    const { data: leaderboardData, isLoading } = useQuery(
        trpc.leaderboard.getLeaderboard.queryOptions({
            period: selectedPeriod,
            limit: 10, // Show top 10 users
            offset: 0,
        })
    )

    const { data: userRank } = useQuery(
        trpc.leaderboard.getUserRank.queryOptions({
            period: selectedPeriod,
        })
    )

    const periods = [
        { value: "all-time", label: "All Time", icon: <TrendingUp className="h-4 w-4" /> },
        { value: "monthly", label: "This Month", icon: <Clock className="h-4 w-4" /> },
        { value: "weekly", label: "This Week", icon: <Calendar className="h-4 w-4" /> },
    ] as const

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border border-[#01DE82]/20 rounded-xl p-4 sm:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-[#01DE82]" />
                    <h2 className="text-lg sm:text-xl font-bold text-[#01DE82]">Leaderboard</h2>
                </div>
                <div className="space-y-2 sm:space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 sm:h-16 bg-[#01DE82]/10 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
        >
            <div className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border border-[#01DE82]/20 rounded-xl relative overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#01DE82]/5 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
                
                <div className="p-4 sm:p-6 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                        <div className="flex items-center space-x-3">
                            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-[#01DE82]" />
                            <h2 className="text-xl sm:text-2xl font-bold text-[#01DE82]">Leaderboard</h2>
                        </div>
                        {userRank && (
                            <span className="bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold">
                                Your Rank: #{userRank.rank}
                            </span>
                        )}
                    </div>

                    <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as Period)} className="space-y-4 sm:space-y-6">
                        <TabsList className="grid w-full grid-cols-3 bg-[#01DE82]/10 backdrop-blur-sm h-10 sm:h-12">
                            {periods.map((period) => (
                                <TabsTrigger
                                    key={period.value}
                                    value={period.value}
                                    className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] data-[state=active]:shadow-lg transition-all duration-300 text-xs sm:text-sm font-medium px-2"
                                >
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <span className="w-4 h-4">{period.icon}</span>
                                        <span className="hidden sm:inline">{period.label}</span>
                                        <span className="sm:hidden text-xs">{period.label.split(' ')[0]}</span>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPeriod}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-2 sm:space-y-3"
                            >
                                {Array.from({ length: 10 }, (_, index) => {
                                    const entry = leaderboardData?.leaderboard[index]
                                    const isEmpty = !entry
                                    const isCurrentUser = !isEmpty && leaderboardData?.currentUserRank?.rank === entry.rank

                                    return (
                                        <LeaderboardEntry
                                            key={`${selectedPeriod}-${index}`}
                                            entry={entry}
                                            index={index}
                                            isCurrentUser={isCurrentUser}
                                            isEmpty={isEmpty}
                                        />
                                    )
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </div>
            </div>
        </motion.div>
    )
}
