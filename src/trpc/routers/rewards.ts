import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

export const rewardsRouter = createTRPCRouter({
    // Get all available rewards
    getRewards: publicProcedure
        .input(z.object({
            category: z.string().optional(),
            limit: z.number().min(1).max(50).default(20),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ input }) => {
            const { category, limit, offset } = input

            const where: any = { isActive: true }
            if (category) where.category = category

            const rewards = await db.reward.findMany({
                where,
                orderBy: { pointsRequired: 'asc' },
                take: limit,
                skip: offset,
            })

            return rewards
        }),

    // Get reward categories
    getCategories: publicProcedure
        .query(async () => {
            const categories = await db.reward.groupBy({
                by: ['category'],
                where: { isActive: true },
                _count: { _all: true }
            })

            return categories.map(cat => ({
                name: cat.category,
                count: cat._count._all
            }))
        }),

    // Redeem a reward
    redeemReward: protectedProcedure
        .input(z.object({
            rewardId: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { kindeId },
                include: {
                    userXP: true
                }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Check if reward exists
            const reward = await db.reward.findUnique({
                where: { id: input.rewardId }
            })

            if (!reward || !reward.isActive) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Reward not found or no longer available",
                })
            }

            // Check if user has enough points
            const userXP = user.userXP
            if (!userXP || userXP.totalXP < reward.pointsRequired) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Insufficient points to redeem this reward",
                })
            }

            // Check if already redeemed (for unique rewards)
            const existingRedemption = await db.userReward.findUnique({
                where: {
                    userId_rewardId: {
                        userId: user.id,
                        rewardId: input.rewardId
                    }
                }
            })

            if (existingRedemption) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You have already redeemed this reward",
                })
            }

            // Create redemption record
            const redemption = await db.userReward.create({
                data: {
                    userId: user.id,
                    rewardId: input.rewardId,
                },
                include: {
                    reward: true
                }
            })

            // Deduct points from user
            await db.userXP.update({
                where: { userId: user.id },
                data: {
                    totalXP: { decrement: reward.pointsRequired }
                }
            })

            // Record points deduction in history
            await db.pointsHistory.create({
                data: {
                    userId: user.id,
                    pointsEarned: -reward.pointsRequired,
                    reason: `Reward Redemption: ${reward.name}`,
                }
            })

            return redemption
        }),

    // Get user's redeemed rewards
    getUserRewards: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            const { limit, offset } = input

            const userRewards = await db.userReward.findMany({
                where: { userId: user.id },
                include: {
                    reward: true
                },
                orderBy: { redeemedAt: 'desc' },
                take: limit,
                skip: offset,
            })

            return userRewards
        }),

    // Check if user can redeem a specific reward
    canRedeem: protectedProcedure
        .input(z.object({
            rewardId: z.number(),
        }))
        .query(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { kindeId },
                include: {
                    userXP: true
                }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            const reward = await db.reward.findUnique({
                where: { id: input.rewardId }
            })

            if (!reward || !reward.isActive) {
                return {
                    canRedeem: false,
                    reason: "Reward not available"
                }
            }

            const userXP = user.userXP
            if (!userXP || userXP.totalXP < reward.pointsRequired) {
                return {
                    canRedeem: false,
                    reason: "Insufficient points",
                    pointsNeeded: reward.pointsRequired - (userXP?.totalXP || 0)
                }
            }

            // Check if already redeemed
            const existingRedemption = await db.userReward.findUnique({
                where: {
                    userId_rewardId: {
                        userId: user.id,
                        rewardId: input.rewardId
                    }
                }
            })

            if (existingRedemption) {
                return {
                    canRedeem: false,
                    reason: "Already redeemed"
                }
            }

            return {
                canRedeem: true,
                reason: "Available for redemption"
            }
        }),

    // Get reward statistics
    getRewardStats: publicProcedure
        .query(async () => {
            const totalRewards = await db.reward.count({
                where: { isActive: true }
            })

            const totalRedemptions = await db.userReward.count()

            const popularRewards = await db.userReward.groupBy({
                by: ['rewardId'],
                _count: { _all: true },
                orderBy: {
                    _count: { rewardId: 'desc' }
                },
                take: 5
            })

            const popularRewardsWithDetails = await Promise.all(
                popularRewards.map(async (pr) => {
                    const reward = await db.reward.findUnique({
                        where: { id: pr.rewardId }
                    })
                    return {
                        reward,
                        redemptionCount: pr._count._all
                    }
                })
            )

            return {
                totalRewards,
                totalRedemptions,
                popularRewards: popularRewardsWithDetails
            }
        }),
})
