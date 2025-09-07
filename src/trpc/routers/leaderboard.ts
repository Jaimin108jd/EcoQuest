import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from "date-fns"

export const leaderboardRouter = createTRPCRouter({
    // Get leaderboard with filters
    getLeaderboard: protectedProcedure
        .input(z.object({
            period: z.enum(["weekly", "monthly", "all-time"]).default("all-time"),
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const currentUser = ctx.dbUser;
            if (!currentUser) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const { period, limit, offset } = input

            let dateFilter = {}
            const now = new Date()

            // Set date filters based on period
            if (period === "weekly") {
                const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday start
                const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
                dateFilter = {
                    createdAt: {
                        gte: weekStart,
                        lte: weekEnd
                    }
                }
            } else if (period === "monthly") {
                const monthStart = startOfMonth(now)
                const monthEnd = endOfMonth(now)
                dateFilter = {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            }

            let leaderboardData: any[] = []

            if (period === "all-time") {
                // For all-time, use UserXP table
                const userXPData = await db.userXP.findMany({
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                picture: true,
                            }
                        }
                    },
                    orderBy: {
                        totalXP: 'desc'
                    },
                    take: limit,
                    skip: offset,
                })

                // Map to consistent structure
                leaderboardData = userXPData.map(userXP => ({
                    user: userXP.user,
                    totalXP: userXP.totalXP,
                    userId: userXP.userId,
                }))
            } else {
                // For weekly/monthly, aggregate from PointsHistory
                const pointsData = await db.pointsHistory.groupBy({
                    by: ['userId'],
                    where: dateFilter,
                    _sum: {
                        pointsEarned: true
                    },
                    orderBy: {
                        _sum: {
                            pointsEarned: 'desc'
                        }
                    },
                    take: limit,
                    skip: offset,
                })

                // Get user details for each entry
                const userIds = pointsData.map(p => p.userId)
                const users = await db.user.findMany({
                    where: {
                        id: { in: userIds }
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        picture: true,
                    }
                })

                // Combine data
                leaderboardData = pointsData.map(point => {
                    const user = users.find(u => u.id === point.userId)
                    return {
                        user,
                        totalXP: point._sum.pointsEarned || 0,
                        userId: point.userId,
                    }
                }).filter(entry => entry.user) // Remove entries without user data
            }

            // Calculate levels and ranks
            const leaderboard = leaderboardData.map((entry, index) => {
                const xp = entry.totalXP || 0
                const level = Math.floor(xp / 100) + 1
                const xpInCurrentLevel = xp % 100
                const xpToNextLevel = 100 - xpInCurrentLevel

                return {
                    rank: offset + index + 1,
                    user: entry.user,
                    totalXP: xp,
                    level,
                    xpInCurrentLevel,
                    xpToNextLevel,
                }
            })

            // Get current user's position
            let currentUserRank = null
            if (period === "all-time") {
                const currentUserXP = await db.userXP.findUnique({
                    where: { userId: currentUser.id }
                })

                if (currentUserXP) {
                    const higherRankedCount = await db.userXP.count({
                        where: {
                            totalXP: {
                                gt: currentUserXP.totalXP
                            }
                        }
                    })
                    currentUserRank = {
                        rank: higherRankedCount + 1,
                        totalXP: currentUserXP.totalXP,
                        level: Math.floor(currentUserXP.totalXP / 100) + 1,
                        xpInCurrentLevel: currentUserXP.totalXP % 100,
                        xpToNextLevel: 100 - (currentUserXP.totalXP % 100),
                    }
                }
            } else {
                const currentUserPoints = await db.pointsHistory.aggregate({
                    where: {
                        userId: currentUser.id,
                        ...dateFilter
                    },
                    _sum: {
                        pointsEarned: true
                    }
                })

                const currentUserXP = currentUserPoints._sum.pointsEarned || 0

                const higherRankedCount = await db.pointsHistory.groupBy({
                    by: ['userId'],
                    where: dateFilter,
                    _sum: {
                        pointsEarned: true
                    },
                    having: {
                        pointsEarned: {
                            _sum: {
                                gt: currentUserXP
                            }
                        }
                    }
                })

                currentUserRank = {
                    rank: higherRankedCount.length + 1,
                    totalXP: currentUserXP,
                    level: Math.floor(currentUserXP / 100) + 1,
                    xpInCurrentLevel: currentUserXP % 100,
                    xpToNextLevel: 100 - (currentUserXP % 100),
                }
            }

            // Get total count for pagination
            let totalCount = 0
            if (period === "all-time") {
                totalCount = await db.userXP.count()
            } else {
                const uniqueUsers = await db.pointsHistory.groupBy({
                    by: ['userId'],
                    where: dateFilter,
                })
                totalCount = uniqueUsers.length
            }

            return {
                leaderboard,
                currentUserRank,
                pagination: {
                    total: totalCount,
                    hasMore: (offset + limit) < totalCount,
                    nextOffset: (offset + limit) < totalCount ? offset + limit : null,
                },
                period,
            }
        }),

    // Get user's ranking details
    getUserRank: protectedProcedure
        .input(z.object({
            period: z.enum(["weekly", "monthly", "all-time"]).default("all-time"),
        }))
        .query(async ({ ctx, input }) => {
            const currentUser = ctx.dbUser;
            if (!currentUser) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const { period } = input
            const now = new Date()
            let dateFilter = {}

            if (period === "weekly") {
                const weekStart = startOfWeek(now, { weekStartsOn: 1 })
                const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
                dateFilter = {
                    createdAt: {
                        gte: weekStart,
                        lte: weekEnd
                    }
                }
            } else if (period === "monthly") {
                const monthStart = startOfMonth(now)
                const monthEnd = endOfMonth(now)
                dateFilter = {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            }

            let userXP = 0
            let rank = 1

            if (period === "all-time") {
                const userXPRecord = await db.userXP.findUnique({
                    where: { userId: currentUser.id }
                })

                userXP = userXPRecord?.totalXP || 0

                const higherRankedCount = await db.userXP.count({
                    where: {
                        totalXP: {
                            gt: userXP
                        }
                    }
                })
                rank = higherRankedCount + 1
            } else {
                const userPoints = await db.pointsHistory.aggregate({
                    where: {
                        userId: currentUser.id,
                        ...dateFilter
                    },
                    _sum: {
                        pointsEarned: true
                    }
                })

                userXP = userPoints._sum.pointsEarned || 0

                const higherRankedUsers = await db.pointsHistory.groupBy({
                    by: ['userId'],
                    where: dateFilter,
                    _sum: {
                        pointsEarned: true
                    },
                    having: {
                        pointsEarned: {
                            _sum: {
                                gt: userXP
                            }
                        }
                    }
                })
                rank = higherRankedUsers.length + 1
            }

            const level = Math.floor(userXP / 100) + 1
            const xpInCurrentLevel = userXP % 100
            const xpToNextLevel = 100 - xpInCurrentLevel

            return {
                rank,
                totalXP: userXP,
                level,
                xpInCurrentLevel,
                xpToNextLevel,
                period,
            }
        }),
})
