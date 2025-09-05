import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

// Validation schemas
const createParticipationSchema = z.object({
    eventId: z.number(),
    wasteCollectedKg: z.number().min(0.1, "Waste collected must be greater than 0"),
    wasteDescription: z.string().optional(),
    proofImageUrl: z.string().optional(),
    afterImageUrl: z.string().optional(),
    wasteImageUrls: z.array(z.string()).optional(),
    collectionLatitude: z.number().min(-90).max(90).optional(),
    collectionLongitude: z.number().min(-180).max(180).optional(),
    collectionLocation: z.string().optional(),
})

// XP calculation based on waste collected
function calculateXP(wasteKg: number): number {
    // Base XP: 10 XP per kg
    // Bonus for larger amounts: +5 XP for every 5kg
    const baseXP = Math.floor(wasteKg * 10)
    const bonusXP = Math.floor(wasteKg / 5) * 5
    return baseXP + bonusXP
}

export const eventParticipationRouter = createTRPCRouter({
    // Submit waste collection data
    create: protectedProcedure
        .input(createParticipationSchema)
        .mutation(async ({ ctx, input }) => {
            const userEmail = ctx.user?.email
            if (!userEmail) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            // Get user from database
            const user = await db.user.findFirst({
                where: { email: userEmail }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Check if event exists and is ongoing
            const event = await db.event.findUnique({
                where: { id: input.eventId },
                select: { status: true, id: true }
            })

            if (!event) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Event not found",
                })
            }

            if (event.status !== "ONGOING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Can only submit waste data during ongoing events",
                })
            }

            // Check if user is registered and has joined the event
            const registration = await db.eventRegistration.findUnique({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: input.eventId
                    }
                }
            })

            if (!registration || !registration.hasJoined) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You must be registered and joined to submit waste data",
                })
            }

            // Check if user has already submitted participation data
            const existingParticipation = await db.eventParticipation.findUnique({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: input.eventId
                    }
                }
            })

            if (existingParticipation) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You have already submitted waste data for this event",
                })
            }

            // Calculate XP earned
            const xpEarned = calculateXP(input.wasteCollectedKg)

            // Create participation record
            const participation = await db.eventParticipation.create({
                data: {
                    ...input,
                    userId: user.id,
                    xpEarned,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            title: true,
                        }
                    }
                }
            })

            // Update or create user XP record
            const userXP = await db.userXP.upsert({
                where: { userId: user.id },
                update: {
                    totalXP: { increment: xpEarned },
                    totalEventsParticipated: { increment: 1 },
                    totalWasteCollected: { increment: input.wasteCollectedKg },
                    lastParticipated: new Date(),
                    // Update streak logic (simplified)
                    currentStreak: { increment: 1 },
                },
                create: {
                    userId: user.id,
                    totalXP: xpEarned,
                    currentLevel: 1,
                    totalEventsParticipated: 1,
                    totalWasteCollected: input.wasteCollectedKg,
                    lastParticipated: new Date(),
                    currentStreak: 1,
                    longestStreak: 1,
                }
            })

            // Calculate new level based on XP
            const newLevel = Math.floor(userXP.totalXP / 100) + 1
            if (newLevel > userXP.currentLevel) {
                await db.userXP.update({
                    where: { userId: user.id },
                    data: { currentLevel: newLevel }
                })
            }

            // Create points history record
            await db.pointsHistory.create({
                data: {
                    userId: user.id,
                    pointsEarned: xpEarned,
                    reason: "Event Participation",
                    eventId: input.eventId,
                    participationId: participation.id,
                }
            })

            return {
                participation,
                xpEarned,
                newLevel: newLevel > userXP.currentLevel ? newLevel : userXP.currentLevel,
                totalXP: userXP.totalXP + xpEarned,
            }
        }),

    // Get user's participation for an event
    getByEventAndUser: protectedProcedure
        .input(z.object({ eventId: z.number() }))
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

            const participation = await db.eventParticipation.findUnique({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: input.eventId
                    }
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                        }
                    }
                }
            })

            return participation
        }),

    // Get all participations for an event (for leaderboard)
    getByEvent: protectedProcedure
        .input(z.object({
            eventId: z.number(),
            limit: z.number().min(1).max(100).default(20),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const { eventId, limit, offset } = input

            const participations = await db.eventParticipation.findMany({
                where: { eventId },
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
                orderBy: { wasteCollectedKg: 'desc' },
                take: limit,
                skip: offset,
            })

            return participations
        }),
})
