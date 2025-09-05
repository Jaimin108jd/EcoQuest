import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import db from "@/lib/db";

const locationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    locationName: z.string(),
});

const ngoSchema = z.object({
    name: z.string().min(2).max(200),
    contactNo: z.string().min(10).max(15),
    location: locationSchema,
    organizationSize: z.number().min(1),
    establishmentYear: z.number().min(1800).max(new Date().getFullYear()),
});

export const userRouter = createTRPCRouter({
    updateUserProfile: protectedProcedure
        .input(z.object({
            first_name: z.string().min(2).max(100).optional(),
            last_name: z.string().min(2).max(100).optional(),
            image_url: z.string().url().optional(),
            role: z.enum(["user", "admin"]),
        })).mutation(async ({ ctx, input }) => {
            const userId = ctx.user?.id;
            if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User Id Not Found!" });

            console.log(`Updating user ${userId} with data:`, input);

            // in future just update the url
            return {
                message: "Updated User Profile"
            };
        }),

    completeOnboarding: protectedProcedure
        .input(z.object({
            role: z.enum(["NORMAL", "ORGANISER"]),
            contactNo: z.string().min(10).max(15),
            location: locationSchema,
            // Normal user fields
            gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
            age: z.number().min(13).max(120).optional(),
            // Organizer fields
            ngo: ngoSchema.optional(),
        })).mutation(async ({ ctx, input }) => {
            const kindeId = ctx.user?.id;
            if (!kindeId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

            try {
                // Find user by kindeId
                const user = await db.user.findUnique({
                    where: { kindeId }
                });

                if (!user) {
                    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
                }

                // If user is an organizer, create NGO first
                let ngoId = null;
                if (input.role === "ORGANISER" && input.ngo) {
                    const createdNgo = await db.nGO.create({
                        data: {
                            name: input.ngo.name,
                            contactNo: input.ngo.contactNo,
                            latitude: input.ngo.location.latitude,
                            longitude: input.ngo.location.longitude,
                            locationName: input.ngo.location.locationName,
                            organizationSize: input.ngo.organizationSize,
                            establishmentYear: input.ngo.establishmentYear,
                        }
                    });
                    ngoId = createdNgo.id;
                }

                // Update user with onboarding data
                const updatedUser = await db.user.update({
                    where: { id: user.id },
                    data: {
                        role: input.role,
                        contactNo: input.contactNo,
                        latitude: input.location.latitude,
                        longitude: input.location.longitude,
                        locationName: input.location.locationName,
                        gender: input.gender,
                        age: input.age,
                        ngoId: ngoId,
                        isOnBoarded: true,
                    }
                });

                return {
                    success: true,
                    message: "Onboarding completed successfully",
                    user: updatedUser
                };

            } catch (error) {
                console.error("Onboarding error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to complete onboarding"
                });
            }
        }),

    getUserProfile: protectedProcedure
        .query(async ({ ctx }) => {
            const kindeId = ctx.user?.id;
            if (!kindeId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

            const user = await db.user.findUnique({
                where: { kindeId },
                include: {
                    ngo: true
                }
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            return user;
        }),

    // CleanQuest Gamification Features

    // Get user dashboard statistics
    getDashboardStats: protectedProcedure
        .query(async ({ ctx }) => {
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

            // Get user XP and stats
            const userXP = await db.userXP.findUnique({
                where: { userId: user.id }
            }) || {
                totalXP: 0,
                currentLevel: 1,
                currentStreak: 0,
                longestStreak: 0,
                totalEventsParticipated: 0,
                totalWasteCollected: 0,
                lastParticipated: null
            }

            // Get registration stats
            const registrationStats = await db.eventRegistration.groupBy({
                by: ['hasJoined'],
                where: { userId: user.id },
                _count: { _all: true }
            })

            const totalRegistrations = registrationStats.reduce((sum, stat) => sum + stat._count._all, 0)
            const joinedEvents = registrationStats.find(stat => stat.hasJoined)?._count._all || 0

            // Get upcoming events count
            const upcomingEvents = await db.eventRegistration.count({
                where: {
                    userId: user.id,
                    event: {
                        status: "UPCOMING",
                        date: { gte: new Date() }
                    }
                }
            })

            // Get completed events count
            const completedEvents = await db.eventRegistration.count({
                where: {
                    userId: user.id,
                    event: { status: "COMPLETED" }
                }
            })

            // Get participation stats
            const participationStats = await db.eventParticipation.aggregate({
                where: { userId: user.id },
                _count: { _all: true },
                _sum: { wasteCollectedKg: true, xpEarned: true }
            })

            // Get recent activities (last 10)
            const recentActivities = await db.pointsHistory.findMany({
                where: { userId: user.id },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            locationName: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            })

            return {
                userXP,
                registrationStats: {
                    totalRegistrations,
                    joinedEvents,
                    upcomingEvents,
                    completedEvents,
                },
                participationStats: {
                    totalParticipations: participationStats._count._all,
                    totalWasteCollected: participationStats._sum.wasteCollectedKg || 0,
                    totalXPEarned: participationStats._sum.xpEarned || 0,
                },
                recentActivities: recentActivities.map(activity => ({
                    id: activity.id,
                    pointsEarned: activity.pointsEarned,
                    reason: activity.reason,
                    createdAt: activity.createdAt,
                    event: activity.event ? {
                        id: activity.event.id,
                        title: activity.event.title,
                        locationName: activity.event.locationName,
                    } : null
                }))
            }
        }),

    // Get user badges
    getBadges: protectedProcedure
        .query(async ({ ctx }) => {
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

            // Get user's earned badges
            const earnedBadges = await db.userBadges.findMany({
                where: { userId: user.id },
                include: {
                    badge: true
                },
                orderBy: { earnedAt: 'desc' }
            })

            // Get all available badges
            const allBadges = await db.badges.findMany({
                orderBy: { createdAt: 'asc' }
            })

            return {
                earnedBadges: earnedBadges.map(ub => ({
                    ...ub.badge,
                    earnedAt: ub.earnedAt
                })),
                availableBadges: allBadges,
                totalEarned: earnedBadges.length,
                totalAvailable: allBadges.length
            }
        }),

    // Get leaderboard
    getLeaderboard: protectedProcedure
        .input(z.object({
            period: z.enum(["weekly", "monthly", "alltime"]).default("alltime"),
            limit: z.number().min(1).max(100).default(10)
        }))
        .query(async ({ ctx, input }) => {
            const { period, limit } = input

            let dateFilter: Date | undefined
            const now = new Date()

            if (period === "weekly") {
                dateFilter = new Date(now.setDate(now.getDate() - 7))
            } else if (period === "monthly") {
                dateFilter = new Date(now.setMonth(now.getMonth() - 1))
            }

            // Get top users by XP
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
                take: limit
            })

            // Get top waste collectors for the period
            const wasteCollectors = await db.eventParticipation.groupBy({
                by: ['userId'],
                _sum: { wasteCollectedKg: true },
                where: dateFilter ? {
                    createdAt: { gte: dateFilter }
                } : undefined,
                orderBy: {
                    _sum: { wasteCollectedKg: 'desc' }
                },
                take: limit
            })

            // Get user details for waste collectors
            const wasteCollectorUsers = await Promise.all(
                wasteCollectors.map(async (collector) => {
                    const user = await db.user.findUnique({
                        where: { id: collector.userId },
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            picture: true,
                        }
                    })
                    return {
                        user,
                        totalWaste: collector._sum.wasteCollectedKg || 0
                    }
                })
            )

            return {
                topByXP: topUsers.map((userXP, index) => ({
                    rank: index + 1,
                    user: userXP.user,
                    totalXP: userXP.totalXP,
                    currentLevel: userXP.currentLevel,
                    currentStreak: userXP.currentStreak,
                    totalEventsParticipated: userXP.totalEventsParticipated,
                    totalWasteCollected: userXP.totalWasteCollected
                })),
                topByWaste: wasteCollectorUsers.map((collector, index) => ({
                    rank: index + 1,
                    user: collector.user,
                    totalWaste: collector.totalWaste
                })),
                period
            }
        }),

    // Get user's event history
    getEventHistory: protectedProcedure
        .input(z.object({
            status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
            limit: z.number().min(1).max(100).default(20),
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

            const { status, limit, offset } = input

            const where: any = { userId: user.id }
            if (status) {
                where.event = { status }
            }

            const registrations = await db.eventRegistration.findMany({
                where,
                include: {
                    event: {
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
                                    participations: true,
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            })

            // Get participation data for each event
            const eventsWithParticipation = await Promise.all(
                registrations.map(async (registration) => {
                    const participation = await db.eventParticipation.findUnique({
                        where: {
                            userId_eventId: {
                                userId: user.id,
                                eventId: registration.event.id
                            }
                        }
                    })

                    return {
                        ...registration.event,
                        registration: {
                            hasJoined: registration.hasJoined,
                            joinedAt: registration.joinedAt,
                            createdAt: registration.createdAt,
                        },
                        participation: participation ? {
                            wasteCollectedKg: participation.wasteCollectedKg,
                            xpEarned: participation.xpEarned,
                            isVerified: participation.isVerified,
                            createdAt: participation.createdAt,
                        } : null
                    }
                })
            )

            return eventsWithParticipation
        }),

    // Get user's points history
    getPointsHistory: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(20),
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

            const pointsHistory = await db.pointsHistory.findMany({
                where: { userId: user.id },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            locationName: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            })

            return pointsHistory
        }),

});