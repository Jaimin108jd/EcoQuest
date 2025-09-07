import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

export const analyticsRouter = createTRPCRouter({
    // Get organizer analytics overview
    getOrganizerOverview: protectedProcedure
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

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can access analytics",
                })
            }

            // Get events created by this organizer
            const events = await db.event.findMany({
                where: { creatorId: user.id },
                include: {
                    participations: true,
                    registrations: true,
                    feedbacks: true,
                }
            })

            const totalEvents = events.length
            const completedEvents = events.filter(e => e.status === "COMPLETED").length
            const ongoingEvents = events.filter(e => e.status === "ONGOING").length
            const upcomingEvents = events.filter(e => e.status === "UPCOMING").length

            const totalParticipants = events.reduce((sum, event) => sum + event.participations.length, 0)
            const totalRegistrations = events.reduce((sum, event) => sum + event.registrations.length, 0)
            const totalWasteCollected = events.reduce((sum, event) =>
                sum + event.participations.reduce((eventSum, p) => eventSum + p.wasteCollectedKg, 0), 0
            )
            const totalFeedbacks = events.reduce((sum, event) => sum + event.feedbacks.length, 0)
            const averageRating = events.reduce((sum, event) => {
                if (event.feedbacks.length === 0) return sum
                const eventAvg = event.feedbacks.reduce((fSum, f) => fSum + f.rating, 0) / event.feedbacks.length
                return sum + eventAvg
            }, 0) / (events.filter(e => e.feedbacks.length > 0).length || 1)

            return {
                totalEvents,
                completedEvents,
                ongoingEvents,
                upcomingEvents,
                totalParticipants,
                totalRegistrations,
                totalWasteCollected,
                totalFeedbacks,
                averageRating: Math.round(averageRating * 10) / 10,
                events: events.map(event => ({
                    id: event.id,
                    title: event.title,
                    status: event.status,
                    date: event.date,
                    participantCount: event.participations.length,
                    registrationCount: event.registrations.length,
                    wasteCollected: event.participations.reduce((sum, p) => sum + p.wasteCollectedKg, 0),
                    averageRating: event.feedbacks.length > 0
                        ? event.feedbacks.reduce((sum, f) => sum + f.rating, 0) / event.feedbacks.length
                        : 0
                }))
            }
        }),

    // Get monthly analytics data
    getMonthlyAnalytics: protectedProcedure
        .input(z.object({
            year: z.number().default(new Date().getFullYear()),
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

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can access analytics",
                })
            }

            const startDate = new Date(input.year, 0, 1)
            const endDate = new Date(input.year + 1, 0, 1)

            // Get events for the year
            const events = await db.event.findMany({
                where: {
                    creatorId: user.id,
                    date: {
                        gte: startDate,
                        lt: endDate
                    }
                },
                include: {
                    participations: true,
                    registrations: true,
                }
            })

            // Group data by month
            const monthlyData = Array.from({ length: 12 }, (_, month) => {
                const monthEvents = events.filter(event => event.date.getMonth() === month)

                return {
                    month: month + 1,
                    monthName: new Date(input.year, month, 1).toLocaleString('default', { month: 'long' }),
                    eventsCount: monthEvents.length,
                    participantsCount: monthEvents.reduce((sum, event) => sum + event.participations.length, 0),
                    registrationsCount: monthEvents.reduce((sum, event) => sum + event.registrations.length, 0),
                    wasteCollected: monthEvents.reduce((sum, event) =>
                        sum + event.participations.reduce((eventSum, p) => eventSum + p.wasteCollectedKg, 0), 0
                    )
                }
            })

            return monthlyData
        }),

    // Get event status distribution
    getEventStatusDistribution: protectedProcedure
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

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can access analytics",
                })
            }

            const events = await db.event.findMany({
                where: { creatorId: user.id },
                select: { status: true }
            })

            const distribution = events.reduce((acc, event) => {
                acc[event.status] = (acc[event.status] || 0) + 1
                return acc
            }, {} as Record<string, number>)

            return [
                { name: 'Upcoming', value: distribution.UPCOMING || 0, color: '#3B82F6' },
                { name: 'Ongoing', value: distribution.ONGOING || 0, color: '#10B981' },
                { name: 'Completed', value: distribution.COMPLETED || 0, color: '#8B5CF6' },
                { name: 'Cancelled', value: distribution.CANCELLED || 0, color: '#EF4444' },
            ]
        }),

    // Get top performing events
    getTopEvents: protectedProcedure
        .input(z.object({
            limit: z.number().default(5),
            sortBy: z.enum(['participants', 'waste', 'rating']).default('participants')
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

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can access analytics",
                })
            }

            const events = await db.event.findMany({
                where: { creatorId: user.id },
                include: {
                    participations: true,
                    feedbacks: true,
                }
            })

            const eventsWithMetrics = events.map(event => ({
                id: event.id,
                title: event.title,
                date: event.date,
                status: event.status,
                participantCount: event.participations.length,
                wasteCollected: event.participations.reduce((sum, p) => sum + p.wasteCollectedKg, 0),
                averageRating: event.feedbacks.length > 0
                    ? event.feedbacks.reduce((sum, f) => sum + f.rating, 0) / event.feedbacks.length
                    : 0,
                feedbackCount: event.feedbacks.length
            }))

            // Sort based on criteria
            const sorted = eventsWithMetrics.sort((a, b) => {
                switch (input.sortBy) {
                    case 'participants':
                        return b.participantCount - a.participantCount
                    case 'waste':
                        return b.wasteCollected - a.wasteCollected
                    case 'rating':
                        return b.averageRating - a.averageRating
                    default:
                        return b.participantCount - a.participantCount
                }
            })

            return sorted.slice(0, input.limit)
        }),

    // Get impact statistics
    getImpactStats: protectedProcedure
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

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can access analytics",
                })
            }

            const events = await db.event.findMany({
                where: { creatorId: user.id },
                include: {
                    participations: true,
                }
            })

            const totalWasteKg = events.reduce((sum, event) =>
                sum + event.participations.reduce((eventSum, p) => eventSum + p.wasteCollectedKg, 0), 0
            )

            // Calculate environmental impact estimates
            const carbonSavedKg = totalWasteKg * 2.1 // Rough estimate: 1kg waste = 2.1kg CO2 saved
            const treesEquivalent = Math.floor(carbonSavedKg / 22) // 1 tree absorbs ~22kg CO2/year
            const energySavedKwh = totalWasteKg * 1.5 // Rough estimate for energy saved from recycling
            const waterSavedLiters = totalWasteKg * 15 // Rough estimate for water saved

            return {
                totalWasteKg,
                carbonSavedKg: Math.round(carbonSavedKg * 10) / 10,
                treesEquivalent,
                energySavedKwh: Math.round(energySavedKwh * 10) / 10,
                waterSavedLiters: Math.round(waterSavedLiters * 10) / 10,
                totalEvents: events.length,
                totalParticipants: events.reduce((sum, event) => sum + event.participations.length, 0)
            }
        })
})
