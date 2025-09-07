import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"
import { checkAndAwardBadges } from "./badges"

// Validation schemas for CleanQuest environmental cleanup events
const createEventSchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().min(1, "Description is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    locationName: z.string().min(1, "Location name is required"),
    date: z.date().refine(date => date > new Date(), "Event date must be in the future"),
    startTime: z.date(),
    wasteTargetKg: z.number().min(0.1, "Waste target must be greater than 0"),
})

const updateEventSchema = z.object({
    id: z.number(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().min(1).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationName: z.string().min(1).optional(),
    date: z.date().optional(),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    wasteTargetKg: z.number().min(0.1).optional(),
    status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
})

// Helper function to generate unique join code
function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const eventsRouter = createTRPCRouter({
    // Create a new event (organizers only)
    create: protectedProcedure
        .input(createEventSchema)
        .mutation(async ({ ctx, input }) => {

            try {
                const kindeId = ctx.user?.id;
                if (!kindeId) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "User not authenticated",
                    })
                }

                // Get user from database to check role and ngoId
                const user = await db.user.findFirst({
                    where: { kindeId },
                    include: { ngo: true }
                })

                if (!user || user.role !== "ORGANISER" || !user.ngoId) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "Only organizers can create events",
                    })
                }

                // Generate unique join code
                let joinCode: string
                let isUnique = false

                do {
                    joinCode = generateJoinCode()
                    const existingEvent = await db.event.findUnique({
                        where: { joinCode }
                    })
                    isUnique = !existingEvent
                    isUnique = true; // Temporarily bypass uniqueness check
                } while (!isUnique)


                const event = await db.event.create({
                    data: {
                        ...input,
                        joinCode,
                        creatorId: user.id,
                        ngoId: user.ngoId,
                    },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            }
                        },
                        ngo: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        _count: {
                            select: {
                                registrations: true,
                            }
                        }
                    }
                })
                return event
            } catch (error) {
                console.log("ERROR", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create event",
                    cause: error
                });
            }
        }),

    // Update an event (creator only)
    update: protectedProcedure
        .input(updateEventSchema)
        .mutation(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const { id, ...updateData } = input

            // Get user from database
            const user = await db.user.findFirst({
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Find the event and verify ownership
            const existingEvent = await db.event.findUnique({
                where: { id },
                select: { creatorId: true, status: true }
            })

            if (!existingEvent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Event not found",
                })
            }

            if (existingEvent.creatorId !== user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only update your own events",
                })
            }

            // Prevent updating completed or cancelled events
            if (existingEvent.status === "COMPLETED" || existingEvent.status === "CANCELLED") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot update completed or cancelled events",
                })
            }

            const updatedEvent = await db.event.update({
                where: { id },
                data: updateData,
                include: {
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    ngo: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    _count: {
                        select: {
                            registrations: true,
                        }
                    }
                }
            })

            return updatedEvent
        }),

    // Delete an event (creator only)
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            // Get user from database
            const user = await db.user.findFirst({
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Find the event and verify ownership
            const event = await db.event.findUnique({
                where: { id: input.id },
                select: { creatorId: true, status: true }
            })

            if (!event) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Event not found",
                })
            }

            if (event.creatorId !== user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only delete your own events",
                })
            }

            // Prevent deleting ongoing events
            if (event.status === "ONGOING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Cannot delete ongoing events",
                })
            }

            await db.event.delete({
                where: { id: input.id }
            })

            return { success: true }
        }),

    // Get all events (with filters) - excludes completed events by default
    list: protectedProcedure
        .input(z.object({
            status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
            creatorId: z.number().optional(),
            ngoId: z.number().optional(),
            limit: z.number().min(1).max(100).default(20),
            offset: z.number().min(0).default(0),
            includeCompleted: z.boolean().default(false),
        }))
        .query(async ({ ctx, input }) => {
            const { status, creatorId, ngoId, limit, offset, includeCompleted } = input

            const where: any = {}
            if (status) {
                where.status = status
            } else if (!includeCompleted) {
                // By default, exclude completed events
                where.status = { in: ["UPCOMING", "ONGOING"] }
            }
            if (creatorId) where.creatorId = creatorId
            if (ngoId) where.ngoId = ngoId

            const events = await db.event.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    ngo: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    _count: {
                        select: {
                            registrations: true,
                        }
                    }
                },
                orderBy: { date: 'asc' },
                take: limit,
                skip: offset,
            })

            return events
        }),

    // Get single event details with enhanced data
    getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            try {
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

                const event = await db.event.findUnique({
                    where: { id: input.id },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            }
                        },
                        ngo: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        registrations: {
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
                            orderBy: { createdAt: 'desc' }
                        },
                        participations: {
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
                            orderBy: { wasteCollectedKg: 'desc' }
                        },
                        feedbacks: {
                            where: { isPublic: true },
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
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                })

                if (!event) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Event not found",
                    })
                }

                // Calculate additional statistics
                const totalWasteCollected = event.participations.reduce((sum, p) => sum + p.wasteCollectedKg, 0)
                const totalParticipants = event.participations.length
                const totalRegistrations = event.registrations.length
                const averageRating = event.feedbacks.length > 0
                    ? event.feedbacks.reduce((sum, f) => sum + f.rating, 0) / event.feedbacks.length
                    : 0
                const progressPercentage = Math.min((totalWasteCollected / event.wasteTargetKg) * 100, 100)

                // Check if current user is registered
                const userRegistration = event.registrations.find(r => r.userId === user.id)

                // Check if current user has participated
                const userParticipation = event.participations.find(p => p.userId === user.id)

                // Check if current user has submitted feedback
                const userFeedback = event.feedbacks.find(f => f.userId === user.id)

                return {
                    ...event,
                    // Only show join code to organizers or event creators
                    joinCode: (user.role === "ORGANISER" && event.creatorId === user.id) ? event.joinCode : undefined,
                    statistics: {
                        totalWasteCollected,
                        totalParticipants,
                        totalRegistrations,
                        averageRating,
                        progressPercentage,
                    },
                    currentUser: {
                        isRegistered: !!userRegistration,
                        hasJoined: !!userRegistration?.hasJoined,
                        hasParticipated: !!userParticipation,
                        hasFeedback: !!userFeedback,
                        isCreator: event.creatorId === user.id,
                        isOrganizer: user.role === "ORGANISER",
                        canRegister: event.status === "UPCOMING" && !userRegistration,
                        canJoin: event.status === "ONGOING" && !!userRegistration && !userRegistration.hasJoined,
                        canParticipate: event.status === "ONGOING" && !!userRegistration?.hasJoined && !userParticipation,
                    }
                }
            } catch (error) {
                console.log("ERROR", error);
            }
        }),

    // Start an event (change status to ongoing)
    startEvent: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id;
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            // Get user from database
            const user = await db.user.findFirst({
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            const event = await db.event.findUnique({
                where: { id: input.id },
                select: { creatorId: true, status: true, startTime: true }
            })

            if (!event) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Event not found",
                })
            }

            if (event.creatorId !== user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only start your own events",
                })
            }

            if (event.status !== "UPCOMING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Only upcoming events can be started",
                })
            }

            const updatedEvent = await db.event.update({
                where: { id: input.id },
                data: {
                    status: "ONGOING",
                    startTime: new Date(), // Update actual start time
                },
            })

            return updatedEvent
        }),

    // End an event (change status to completed)
    endEvent: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id;
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            // Get user from database
            const user = await db.user.findFirst({
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            const event = await db.event.findUnique({
                where: { id: input.id },
                select: { creatorId: true, status: true }
            })

            if (!event) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Event not found",
                })
            }

            if (event.creatorId !== user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only end your own events",
                })
            }

            if (event.status !== "ONGOING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Only ongoing events can be ended",
                })
            }

            const updatedEvent = await db.event.update({
                where: { id: input.id },
                data: {
                    status: "COMPLETED",
                    endTime: new Date(), // Record actual end time
                },
            })

            return updatedEvent
        }),

    // Get events created by current user (for organizers)
    myEvents: protectedProcedure
        .input(z.object({
            status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
            limit: z.number().min(1).max(100).default(20),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id;
            if (!kindeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not authenticated",
                })
            }

            const { status, limit, offset } = input

            // Get user from database
            const user = await db.user.findFirst({
                where: { kindeId }
            })

            if (!user || user.role !== "ORGANISER") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only organizers can view their events",
                })
            }

            const where: any = { creatorId: user.id }
            if (status) where.status = status

            const events = await db.event.findMany({
                where,
                include: {
                    ngo: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    _count: {
                        select: {
                            registrations: true,
                        }
                    }
                },
                orderBy: { date: 'asc' },
                take: limit,
                skip: offset,
            })

            return events
        }),

    // Get nearby events for normal users
    nearby: protectedProcedure
        .input(z.object({
            userLatitude: z.number().min(-90).max(90),
            userLongitude: z.number().min(-180).max(180),
            radiusKm: z.number().min(1).max(100).default(50),
            status: z.enum(["UPCOMING", "ONGOING"]).default("UPCOMING"),
            limit: z.number().min(1).max(100).default(20),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const { userLatitude, userLongitude, radiusKm, status, limit, offset } = input

            // Calculate distance using Haversine formula in SQL
            const events = await db.event.findMany({
                where: {
                    status,
                    // Add date filter to only show future events for UPCOMING
                    ...(status === "UPCOMING" && { date: { gte: new Date() } })
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    ngo: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    _count: {
                        select: {
                            registrations: true,
                        }
                    }
                },
                orderBy: { date: 'asc' },
                take: limit,
                skip: offset,
            })

            // Filter by distance (we'll do this in memory for now, but could be optimized with PostGIS)
            const eventsWithDistance = events.map(event => {
                const distance = calculateDistance(
                    userLatitude,
                    userLongitude,
                    event.latitude,
                    event.longitude
                )
                return { ...event, distance }
            }).filter(event => event.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance)

            return eventsWithDistance
        }),

    // Join an event by join code (for volunteers)
    joinByCode: protectedProcedure
        .input(z.object({ joinCode: z.string().min(6).max(6) }))
        .mutation(async ({ ctx, input }) => {
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

            // Find event by join code
            const event = await db.event.findUnique({
                where: { joinCode: input.joinCode.toUpperCase() },
                select: { id: true, status: true, title: true, date: true, locationName: true }
            })

            if (!event) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Invalid join code",
                })
            }

            if (event.status === "COMPLETED" || event.status === "CANCELLED") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "This event has ended",
                })
            }

            // Check if already registered
            const existingRegistration = await db.eventRegistration.findUnique({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: event.id
                    }
                }
            })

            if (existingRegistration) {
                // If already registered and already joined, return error
                if (existingRegistration.hasJoined) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Already checked in to this event",
                    })
                }

                // If registered but not joined, check them in
                const updatedRegistration = await db.eventRegistration.update({
                    where: {
                        userId_eventId: {
                            userId: user.id,
                            eventId: event.id
                        }
                    },
                    data: {
                        hasJoined: true,
                        joinedAt: new Date(),
                    },
                    include: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                date: true,
                                locationName: true,
                            }
                        }
                    }
                })

                // Award +20 XP for checking in
                await db.pointsHistory.create({
                    data: {
                        userId: user.id,
                        pointsEarned: 20,
                        reason: "Event Check-in",
                        eventId: event.id,
                    }
                })

                // Update user XP
                await db.userXP.upsert({
                    where: { userId: user.id },
                    update: {
                        totalXP: { increment: 20 }
                    },
                    create: {
                        userId: user.id,
                        totalXP: 20,
                    }
                })

                return updatedRegistration
            }

            // Create registration and immediately check in
            const registration = await db.eventRegistration.create({
                data: {
                    userId: user.id,
                    eventId: event.id,
                    hasJoined: true,
                    joinedAt: new Date(),
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            date: true,
                            locationName: true,
                        }
                    }
                }
            })

            // Award XP for both registration and check-in (30 total)
            await db.pointsHistory.create({
                data: {
                    userId: user.id,
                    pointsEarned: 30,
                    reason: "Event Registration & Check-in",
                    eventId: event.id,
                }
            })

            // Update user XP
            await db.userXP.upsert({
                where: { userId: user.id },
                update: {
                    totalXP: { increment: 30 }
                },
                create: {
                    userId: user.id,
                    totalXP: 30,
                }
            })

            return registration
        }),

    // Verify participation (organizers only)
    verifyParticipation: protectedProcedure
        .input(z.object({
            participationId: z.number(),
            isVerified: z.boolean(),
            bonusXP: z.number().min(0).max(100).default(0),
        }))
        .mutation(async ({ ctx, input }) => {
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
                    message: "Only organizers can verify participations",
                })
            }

            // Get participation and verify organizer owns the event
            const participation = await db.eventParticipation.findUnique({
                where: { id: input.participationId },
                include: {
                    event: {
                        select: { creatorId: true, title: true }
                    },
                    user: {
                        select: { id: true, firstName: true, lastName: true }
                    }
                }
            })

            if (!participation) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Participation not found",
                })
            }

            if (participation.event.creatorId !== user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only verify participations for your own events",
                })
            }

            // Update participation
            const updatedParticipation = await db.eventParticipation.update({
                where: { id: input.participationId },
                data: {
                    isVerified: input.isVerified,
                    xpEarned: input.isVerified
                        ? { increment: input.bonusXP }
                        : participation.xpEarned
                },
            })

            // Award bonus XP if verified
            if (input.isVerified && input.bonusXP > 0) {
                await db.pointsHistory.create({
                    data: {
                        userId: participation.user.id,
                        pointsEarned: input.bonusXP,
                        reason: "Organizer Verification Bonus",
                        eventId: participation.eventId,
                        participationId: participation.id,
                    }
                })

                // Update user XP
                await db.userXP.update({
                    where: { userId: participation.user.id },
                    data: {
                        totalXP: { increment: input.bonusXP }
                    }
                })
            }

            return updatedParticipation
        }),

    // Get participations for organizer review
    getParticipationsForReview: protectedProcedure
        .input(z.object({
            eventId: z.number(),
            verified: z.boolean().optional(),
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
                    message: "Only organizers can review participations",
                })
            }

            // Verify organizer owns the event
            const event = await db.event.findUnique({
                where: { id: input.eventId },
                select: { creatorId: true }
            })

            if (!event || event.creatorId !== user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only review participations for your own events",
                })
            }

            const where: any = { eventId: input.eventId }
            if (input.verified !== undefined) {
                where.isVerified = input.verified
            }

            const participations = await db.eventParticipation.findMany({
                where,
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
                orderBy: { createdAt: 'desc' }
            })

            return participations
        }),

    // Join an event by event ID (for volunteers) - DEPRECATED: Use joinByCode instead
    joinEvent: protectedProcedure
        .input(z.object({ eventId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            throw new TRPCError({
                code: "METHOD_NOT_SUPPORTED",
                message: "Please use the join code to register for events",
            })
        }),

    // Check-in to an ongoing event (QR code scan)
    checkIn: protectedProcedure
        .input(z.object({
            eventId: z.number(),
            latitude: z.number().optional(),
            longitude: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
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

            // Check if event exists and is ongoing
            const event = await db.event.findUnique({
                where: { id: input.eventId },
                select: { id: true, status: true }
            })

            if (!event || event.status !== "ONGOING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Event is not currently ongoing",
                })
            }

            // Check if user is registered
            const registration = await db.eventRegistration.findUnique({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: input.eventId
                    }
                }
            })

            if (!registration) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You must register for the event first",
                })
            }

            if (registration.hasJoined) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Already checked in to this event",
                })
            }

            // Update registration to mark as joined
            const updatedRegistration = await db.eventRegistration.update({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: input.eventId
                    }
                },
                data: {
                    hasJoined: true,
                    joinedAt: new Date(),
                }
            })

            // Award +20 XP for checking in
            await db.pointsHistory.create({
                data: {
                    userId: user.id,
                    pointsEarned: 20,
                    reason: "Event Check-in",
                    eventId: input.eventId,
                }
            })

            // Update user XP
            await db.userXP.upsert({
                where: { userId: user.id },
                update: {
                    totalXP: { increment: 20 }
                },
                create: {
                    userId: user.id,
                    totalXP: 20,
                }
            })

            return updatedRegistration
        }),

    // Submit waste collection participation
    submitParticipation: protectedProcedure
        .input(z.object({
            eventId: z.number(),
            wasteCollectedKg: z.number().min(0.1, "Must collect at least 0.1kg"),
            wasteDescription: z.string().optional(),
            proofImageUrl: z.string().optional(),
            afterImageUrl: z.string().optional(),
            wasteImageUrls: z.array(z.string()).default([]),
            collectionLatitude: z.number().optional(),
            collectionLongitude: z.number().optional(),
            collectionLocation: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
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

            // Check if user has checked in to the event
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
                    message: "You must check in to the event first",
                })
            }

            // Check if already submitted participation
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
                    code: "CONFLICT",
                    message: "Participation already submitted for this event",
                })
            }

            // Calculate XP based on waste collected (50 XP base + 5 XP per kg)
            const baseXP = 50
            const bonusXP = Math.floor(input.wasteCollectedKg * 5)
            const totalXP = baseXP + bonusXP

            // Create participation record
            const participation = await db.eventParticipation.create({
                data: {
                    userId: user.id,
                    eventId: input.eventId,
                    wasteCollectedKg: input.wasteCollectedKg,
                    wasteDescription: input.wasteDescription,
                    proofImageUrl: input.proofImageUrl,
                    afterImageUrl: input.afterImageUrl,
                    wasteImageUrls: input.wasteImageUrls,
                    collectionLatitude: input.collectionLatitude,
                    collectionLongitude: input.collectionLongitude,
                    collectionLocation: input.collectionLocation,
                    xpEarned: totalXP,
                }
            })

            // Award XP for participation
            await db.pointsHistory.create({
                data: {
                    userId: user.id,
                    pointsEarned: totalXP,
                    reason: `Waste Collection: ${input.wasteCollectedKg}kg`,
                    eventId: input.eventId,
                    participationId: participation.id,
                }
            })

            // Update user XP and stats
            await db.userXP.upsert({
                where: { userId: user.id },
                update: {
                    totalXP: { increment: totalXP },
                    totalEventsParticipated: { increment: 1 },
                    totalWasteCollected: { increment: input.wasteCollectedKg },
                    lastParticipated: new Date(),
                    currentStreak: { increment: 1 }, // Simplified streak calculation
                },
                create: {
                    userId: user.id,
                    totalXP: totalXP,
                    totalEventsParticipated: 1,
                    totalWasteCollected: input.wasteCollectedKg,
                    lastParticipated: new Date(),
                    currentStreak: 1,
                }
            })

            // Check for new badges after participation
            await checkAndAwardBadges(user.id)

            return participation
        }),

    // Submit feedback for completed events
    submitFeedback: protectedProcedure
        .input(z.object({
            eventId: z.number(),
            rating: z.number().min(1).max(5),
            comment: z.string().min(1, "Comment is required").max(1000, "Comment must be less than 1000 characters"),
            category: z.string().default("general"),
            isPublic: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
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

            // Check if event exists and is completed
            const event = await db.event.findUnique({
                where: { id: input.eventId },
                select: { id: true, status: true }
            })

            if (!event) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Event not found",
                })
            }

            if (event.status !== "COMPLETED") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Can only submit feedback for completed events",
                })
            }

            // Check if user participated in the event
            const participation = await db.eventParticipation.findUnique({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: input.eventId
                    }
                }
            })

            if (!participation) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You must participate in the event to leave feedback",
                })
            }

            // Check if feedback already exists
            const existingFeedback = await db.eventFeedback.findUnique({
                where: {
                    userId_eventId: {
                        userId: user.id,
                        eventId: input.eventId
                    }
                }
            })

            if (existingFeedback) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You have already submitted feedback for this event",
                })
            }

            // Create feedback
            const feedback = await db.eventFeedback.create({
                data: {
                    userId: user.id,
                    eventId: input.eventId,
                    rating: input.rating,
                    comment: input.comment,
                    category: input.category,
                    isPublic: input.isPublic,
                }
            })

            return feedback
        }),
})

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}
