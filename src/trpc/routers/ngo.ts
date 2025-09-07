import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

const updateNGOSchema = z.object({
    name: z.string().min(1, "NGO name is required").max(255),
    contactNo: z.string().min(10, "Valid contact number is required").max(20),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    locationName: z.string().min(1, "Location name is required"),
    organizationSize: z.number().min(1, "Organization size must be at least 1"),
    establishmentYear: z.number().min(1800).max(new Date().getFullYear()),
})

export const ngoRouter = createTRPCRouter({
    // Get NGO details for current organizer
    getMyNGO: protectedProcedure
        .query(async ({ ctx }) => {
            const kindeId = ctx.user?.id;
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { kindeId },
                include: {
                    ngo: true
                }
            })

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can access NGO details",
                })
            }

            if (!user.ngo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "NGO not found",
                })
            }

            return user.ngo
        }),

    // Update NGO details
    updateNGO: protectedProcedure
        .input(updateNGOSchema)
        .mutation(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id;
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const user = await db.user.findFirst({
                where: { kindeId },
                include: {
                    ngo: true
                }
            })

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can update NGO details",
                })
            }

            if (!user.ngo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "NGO not found",
                })
            }

            const updatedNGO = await db.nGO.update({
                where: { id: user.ngo.id },
                data: input
            })

            return updatedNGO
        }),

    // Get NGO statistics
    getNGOStats: protectedProcedure
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

            if (!user || user.role !== "ORGANISER" || !user.ngoId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can access NGO statistics",
                })
            }

            // Get all events from this NGO
            const events = await db.event.findMany({
                where: { ngoId: user.ngoId },
                include: {
                    participations: true,
                    registrations: true,
                    feedbacks: true,
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })

            // Get all organizers in this NGO
            const organizers = await db.user.findMany({
                where: {
                    ngoId: user.ngoId,
                    role: "ORGANISER"
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    createdAt: true,
                    _count: {
                        select: {
                            createdEvents: true
                        }
                    }
                }
            })

            const totalEvents = events.length
            const totalParticipants = events.reduce((sum, event) => sum + event.participations.length, 0)
            const totalWasteCollected = events.reduce((sum, event) =>
                sum + event.participations.reduce((eventSum, p) => eventSum + p.wasteCollectedKg, 0), 0
            )
            const totalFeedbacks = events.reduce((sum, event) => sum + event.feedbacks.length, 0)
            const averageRating = events.reduce((sum, event) => {
                if (event.feedbacks.length === 0) return sum
                const eventAvg = event.feedbacks.reduce((fSum, f) => fSum + f.rating, 0) / event.feedbacks.length
                return sum + eventAvg
            }, 0) / (events.filter(e => e.feedbacks.length > 0).length || 1)

            // Calculate monthly data for the last 12 months
            const now = new Date()
            const monthlyData = Array.from({ length: 12 }, (_, i) => {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthEvents = events.filter(event => {
                    const eventDate = new Date(event.date)
                    return eventDate.getMonth() === date.getMonth() &&
                        eventDate.getFullYear() === date.getFullYear()
                })

                return {
                    month: date.toLocaleString('default', { month: 'short' }),
                    events: monthEvents.length,
                    participants: monthEvents.reduce((sum, event) => sum + event.participations.length, 0),
                    waste: monthEvents.reduce((sum, event) =>
                        sum + event.participations.reduce((eventSum, p) => eventSum + p.wasteCollectedKg, 0), 0
                    )
                }
            }).reverse()

            return {
                totalEvents,
                totalParticipants,
                totalWasteCollected,
                totalFeedbacks,
                averageRating: Math.round(averageRating * 10) / 10,
                totalOrganizers: organizers.length,
                monthlyData,
                organizers,
                recentEvents: events
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
            }
        })
})
