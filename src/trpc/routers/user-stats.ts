import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

export const userStatsRouter = createTRPCRouter({
    // Get user's comprehensive statistics
    getStats: protectedProcedure
        .query(async ({ ctx }) => {
            const userEmail = ctx.user?.email
            if (!userEmail) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { email: userEmail }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Get user XP data
            const userXP = await db.userXP.findUnique({
                where: { userId: user.id }
            })

            // Calculate correct level based on total XP
            const totalXP = userXP?.totalXP || 0
            const calculatedLevel = Math.floor(totalXP / 100) + 1

            // Calculate corrected userXP with proper level
            const correctedUserXP = userXP ? {
                ...userXP,
                currentLevel: calculatedLevel
            } : {
                totalXP: 0,
                currentLevel: 1,
                currentStreak: 0,
                longestStreak: 0,
                totalEventsParticipated: 0,
                totalWasteCollected: 0,
            }

            // Get registration stats
            const registrationStats = await db.eventRegistration.aggregate({
                where: { userId: user.id },
                _count: { id: true }
            })

            // Get participation stats
            const participationStats = await db.eventParticipation.aggregate({
                where: { userId: user.id },
                _count: { id: true },
                _sum: { wasteCollectedKg: true, xpEarned: true }
            })

            // Get event status breakdown
            const eventBreakdown = await db.eventRegistration.findMany({
                where: { userId: user.id },
                include: {
                    event: {
                        select: { status: true }
                    }
                }
            })

            const statusCounts = eventBreakdown.reduce((acc, reg) => {
                const status = reg.event.status
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {} as Record<string, number>)

            // Get recent activities
            const recentParticipations = await db.eventParticipation.findMany({
                where: { userId: user.id },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            date: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            })

            return {
                userXP: correctedUserXP,
                registrationStats: {
                    totalRegistrations: registrationStats._count.id,
                    upcomingEvents: statusCounts.UPCOMING || 0,
                    ongoingEvents: statusCounts.ONGOING || 0,
                    completedEvents: statusCounts.COMPLETED || 0,
                    cancelledEvents: statusCounts.CANCELLED || 0,
                },
                participationStats: {
                    totalParticipations: participationStats._count.id,
                    totalWasteCollected: participationStats._sum.wasteCollectedKg || 0,
                    totalXPEarned: participationStats._sum.xpEarned || 0,
                },
                recentActivities: recentParticipations,
            }
        }),

    // Get user's badges
    getBadges: protectedProcedure
        .query(async ({ ctx }) => {
            const userEmail = ctx.user?.email
            if (!userEmail) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { email: userEmail }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Get user's earned badges
            const userBadges = await db.userBadges.findMany({
                where: { userId: user.id },
                include: {
                    badge: true
                },
                orderBy: { earnedAt: 'desc' }
            })

            // Get available badges that user hasn't earned
            const earnedBadgeIds = userBadges.map(ub => ub.badgeId)
            const availableBadges = await db.badges.findMany({
                where: {
                    id: { notIn: earnedBadgeIds }
                },
                orderBy: { requiredXP: 'asc' }
            })

            return {
                earnedBadges: userBadges,
                availableBadges: availableBadges,
                totalEarned: userBadges.length,
                totalAvailable: availableBadges.length + userBadges.length
            }
        }),

    // Get points history
    getPointsHistory: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const userEmail = ctx.user?.email
            if (!userEmail) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { email: userEmail }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            const pointsHistory = await db.pointsHistory.findMany({
                where: { userId: user.id },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: input.limit,
                skip: input.offset,
            })

            const totalCount = await db.pointsHistory.count({
                where: { userId: user.id }
            })

            return {
                history: pointsHistory,
                totalCount,
                hasMore: input.offset + input.limit < totalCount
            }
        }),

    // Get leaderboard (top users by XP)
    getLeaderboard: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(10),
        }))
        .query(async ({ ctx, input }) => {
            const topUsers = await db.userXP.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            picture: true,
                        }
                    }
                },
                orderBy: { totalXP: 'desc' },
                take: input.limit,
            })

            // Get current user's rank
            const userEmail = ctx.user?.email
            let currentUserRank = null

            if (userEmail) {
                const user = await db.user.findFirst({
                    where: { email: userEmail }
                })

                if (user) {
                    const higherRankedCount = await db.userXP.count({
                        where: {
                            totalXP: {
                                gt: (await db.userXP.findUnique({
                                    where: { userId: user.id }
                                }))?.totalXP || 0
                            }
                        }
                    })

                    currentUserRank = higherRankedCount + 1
                }
            }

            return {
                leaderboard: topUsers.map((userXP, index) => ({
                    rank: index + 1,
                    user: userXP.user,
                    totalXP: userXP.totalXP,
                    currentLevel: userXP.currentLevel,
                    totalWasteCollected: userXP.totalWasteCollected,
                    totalEventsParticipated: userXP.totalEventsParticipated,
                })),
                currentUserRank
            }
        }),
})
