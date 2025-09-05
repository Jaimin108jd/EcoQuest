import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

export const eventRegistrationRouter = createTRPCRouter({
  // Register for an event (normal users)
  register: protectedProcedure
    .input(z.object({
      eventId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const kindeId = ctx.user?.id
      if (!kindeId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        })
      }

      // Get user from database
      const user = await db.user.findUnique({
        where: { kindeId }
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Check if event exists and is upcoming
      const event = await db.event.findUnique({
        where: { id: input.eventId },
        select: { id: true, status: true, date: true }
      })

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        })
      }

      if (event.status !== "UPCOMING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only register for upcoming events",
        })
      }

      if (event.date < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot register for past events",
        })
      }

      // Check if user is already registered
      const existingRegistration = await db.eventRegistration.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: input.eventId
          }
        }
      })

      if (existingRegistration) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already registered for this event",
        })
      }

      // Create registration
      const registration = await db.eventRegistration.create({
        data: {
          userId: user.id,
          eventId: input.eventId,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              joinCode: true,
            }
          }
        }
      })

      return registration
    }),

  // Join an event (mark as joined via QR code or join code)
  joinEvent: protectedProcedure
    .input(z.object({
      joinCode: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const kindeId = ctx.user?.id
      if (!kindeId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        })
      }

      // Get user from database
      const user = await db.user.findUnique({
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
        where: { joinCode: input.joinCode },
        select: { id: true, status: true, title: true }
      })

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid join code",
        })
      }

      if (event.status !== "ONGOING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is not currently ongoing",
        })
      }

      // Find user's registration
      const registration = await db.eventRegistration.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: event.id
          }
        }
      })

      if (!registration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must register for this event first",
        })
      }

      if (registration.hasJoined) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already joined this event",
        })
      }

      // Mark as joined
      const updatedRegistration = await db.eventRegistration.update({
        where: { id: registration.id },
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
            }
          }
        }
      })

      return updatedRegistration
    }),

  // Unregister from an event
  unregister: protectedProcedure
    .input(z.object({
      eventId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const kindeId = ctx.user?.id
      if (!kindeId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        })
      }

      // Get user from database
      const user = await db.user.findUnique({
        where: { kindeId }
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Check if event allows unregistration
      const event = await db.event.findUnique({
        where: { id: input.eventId },
        select: { status: true, date: true }
      })

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        })
      }

      if (event.status === "ONGOING" || event.status === "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot unregister from ongoing or completed events",
        })
      }

      // Find registration
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
          code: "NOT_FOUND",
          message: "Not registered for this event",
        })
      }

      // Delete registration
      await db.eventRegistration.delete({
        where: { id: registration.id }
      })

      return { success: true }
    }),

  // Get user's registered events
  myRegistrations: protectedProcedure
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

      const { status, limit, offset } = input

      // Get user from database
      const user = await db.user.findUnique({
        where: { kindeId }
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      const where: any = { userId: user.id }
      if (status) {
        where.event = { status }
      }

      const registrations = await db.eventRegistration.findMany({
        where,
        include: {
          event: {
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
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
          }
        },
        orderBy: { event: { date: 'asc' } },
        take: limit,
        skip: offset,
      })

      return registrations
    }),

  // Get registration status for a specific event
  getRegistrationStatus: protectedProcedure
    .input(z.object({
      eventId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const kindeId = ctx.user?.id
      if (!kindeId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        })
      }

      // Get user from database
      const user = await db.user.findUnique({
        where: { kindeId }
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      const registration = await db.eventRegistration.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: input.eventId
          }
        },
        select: {
          id: true,
          hasJoined: true,
          joinedAt: true,
          createdAt: true,
        }
      })

      return {
        isRegistered: !!registration,
        hasJoined: registration?.hasJoined || false,
        joinedAt: registration?.joinedAt,
        registeredAt: registration?.createdAt,
      }
    }),
})
