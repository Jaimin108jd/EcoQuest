import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

// Badge achievement checking logic
async function checkAndAwardBadges(userId: number) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: {
            userXP: true,
            userBadges: { include: { badge: true } },
            participations: true,
            registeredEvents: true,
        }
    })

    if (!user || !user.userXP) return []

    const userStats = user.userXP
    const earnedBadgeIds = new Set(user.userBadges.map(ub => ub.badgeId))
    const newBadges = []

    // Define all available badges
    const badgeChecks = [
        // Participation Badges
        {
            name: "First Steps",
            description: "Complete your first environmental cleanup event",
            category: "participation",
            rarity: "common",
            iconUrl: "/badges/first-steps.svg",
            check: () => userStats.totalEventsParticipated >= 1
        },
        {
            name: "Eco Warrior",
            description: "Participate in 5 environmental cleanup events",
            category: "participation",
            rarity: "uncommon",
            iconUrl: "/badges/eco-warrior.svg",
            check: () => userStats.totalEventsParticipated >= 5
        },
        {
            name: "Green Champion",
            description: "Participate in 15 environmental cleanup events",
            category: "participation",
            rarity: "rare",
            iconUrl: "/badges/green-champion.svg",
            check: () => userStats.totalEventsParticipated >= 15
        },
        {
            name: "Environmental Hero",
            description: "Participate in 30 environmental cleanup events",
            category: "participation",
            rarity: "epic",
            iconUrl: "/badges/environmental-hero.svg",
            check: () => userStats.totalEventsParticipated >= 30
        },

        // Waste Collection Badges
        {
            name: "Waste Collector",
            description: "Collect your first kilogram of waste",
            category: "waste",
            rarity: "common",
            iconUrl: "/badges/waste-collector.svg",
            check: () => userStats.totalWasteCollected >= 1
        },
        {
            name: "Cleanup Specialist",
            description: "Collect 25kg of waste across all events",
            category: "waste",
            rarity: "uncommon",
            iconUrl: "/badges/cleanup-specialist.svg",
            check: () => userStats.totalWasteCollected >= 25
        },
        {
            name: "Waste Warrior",
            description: "Collect 100kg of waste across all events",
            category: "waste",
            rarity: "rare",
            iconUrl: "/badges/waste-warrior.svg",
            check: () => userStats.totalWasteCollected >= 100
        },
        {
            name: "Planet Protector",
            description: "Collect 500kg of waste across all events",
            category: "waste",
            rarity: "epic",
            iconUrl: "/badges/planet-protector.svg",
            check: () => userStats.totalWasteCollected >= 500
        },

        // XP/Level Badges
        {
            name: "Rising Star",
            description: "Reach 500 XP points",
            category: "achievement",
            rarity: "common",
            iconUrl: "/badges/rising-star.svg",
            check: () => userStats.totalXP >= 500
        },
        {
            name: "Experienced Volunteer",
            description: "Reach 2,000 XP points",
            category: "achievement",
            rarity: "uncommon",
            iconUrl: "/badges/experienced-volunteer.svg",
            check: () => userStats.totalXP >= 2000
        },
        {
            name: "Master Volunteer",
            description: "Reach 10,000 XP points",
            category: "achievement",
            rarity: "rare",
            iconUrl: "/badges/master-volunteer.svg",
            check: () => userStats.totalXP >= 10000
        },
        {
            name: "Legendary Eco-Activist",
            description: "Reach 50,000 XP points",
            category: "achievement",
            rarity: "legendary",
            iconUrl: "/badges/legendary-eco-activist.svg",
            check: () => userStats.totalXP >= 50000
        },

        // Streak Badges
        {
            name: "Consistent Helper",
            description: "Maintain a 3-event participation streak",
            category: "streak",
            rarity: "uncommon",
            iconUrl: "/badges/consistent-helper.svg",
            check: () => userStats.currentStreak >= 3
        },
        {
            name: "Dedication Master",
            description: "Maintain a 7-event participation streak",
            category: "streak",
            rarity: "rare",
            iconUrl: "/badges/dedication-master.svg",
            check: () => userStats.currentStreak >= 7
        },
        {
            name: "Unstoppable Force",
            description: "Maintain a 15-event participation streak",
            category: "streak",
            rarity: "epic",
            iconUrl: "/badges/unstoppable-force.svg",
            check: () => userStats.currentStreak >= 15
        },

        // Special Achievement Badges  
        {
            name: "Early Adopter",
            description: "One of the first 100 users to join EcoQuest",
            category: "special",
            rarity: "rare",
            iconUrl: "/badges/early-adopter.svg",
            check: () => user.id <= 100
        },
        {
            name: "Community Builder",
            description: "Register for 10 different events",
            category: "special",
            rarity: "uncommon",
            iconUrl: "/badges/community-builder.svg",
            check: () => user.registeredEvents.length >= 10
        }
    ]

    // Check each badge and award if criteria met
    for (const badgeData of badgeChecks) {
        // Check if badge already exists in database
        let badge = await db.badges.findUnique({
            where: { name: badgeData.name }
        })

        // Create badge if it doesn't exist
        if (!badge) {
            badge = await db.badges.create({
                data: {
                    name: badgeData.name,
                    description: badgeData.description,
                    category: badgeData.category,
                    rarity: badgeData.rarity,
                    iconUrl: badgeData.iconUrl,
                }
            })
        }

        // Check if user should earn this badge
        if (!earnedBadgeIds.has(badge.id) && badgeData.check()) {
            const userBadge = await db.userBadges.create({
                data: {
                    userId: user.id,
                    badgeId: badge.id,
                },
                include: { badge: true }
            })
            newBadges.push(userBadge)
        }
    }

    return newBadges
}

export const badgesRouter = createTRPCRouter({
    // Get all badges with user's earned status
    getUserBadges: protectedProcedure
        .query(async ({ ctx }) => {
            const kindeId = ctx.user?.id;
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

            // Get all badges
            const allBadges = await db.badges.findMany({
                orderBy: [
                    { category: 'asc' },
                    { name: 'asc' }
                ]
            })

            // Get user's earned badges
            const earnedBadges = await db.userBadges.findMany({
                where: { userId: user.id },
                include: { badge: true },
                orderBy: { earnedAt: 'desc' }
            })

            const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId))

            // Add earned status to all badges
            const badgesWithStatus = allBadges.map(badge => ({
                ...badge,
                earned: earnedBadgeIds.has(badge.id),
                earnedAt: earnedBadges.find(ub => ub.badgeId === badge.id)?.earnedAt
            }))

            return {
                allBadges: badgesWithStatus,
                earnedBadges,
                totalEarned: earnedBadges.length,
                totalAvailable: allBadges.length,
            }
        }),

    // Check and award badges for a user (called after events)
    checkBadges: protectedProcedure
        .mutation(async ({ ctx }) => {
            const kindeId = ctx.user?.id;
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

            const newBadges = await checkAndAwardBadges(user.id)
            return newBadges
        }),

    // Get badges by category
    getBadgesByCategory: protectedProcedure
        .input(z.object({
            category: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id;
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

            const badges = await db.badges.findMany({
                where: { category: input.category },
                orderBy: { name: 'asc' }
            })

            const earnedBadges = await db.userBadges.findMany({
                where: {
                    userId: user.id,
                    badge: { category: input.category }
                },
                include: { badge: true }
            })

            const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId))

            const badgesWithStatus = badges.map(badge => ({
                ...badge,
                earned: earnedBadgeIds.has(badge.id),
                earnedAt: earnedBadges.find(ub => ub.badgeId === badge.id)?.earnedAt
            }))

            return badgesWithStatus
        }),
})

// Export the badge checking function for use in other routers
export { checkAndAwardBadges }
