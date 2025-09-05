import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../init"
import { TRPCError } from "@trpc/server"
import db from "@/lib/db"

export const communityRouter = createTRPCRouter({
    // Create a new post
    createPost: protectedProcedure
        .input(z.object({
            content: z.string().min(1).max(1000).optional(),
            mediaUrl: z.string().url().optional(),
            eventId: z.number().optional(),
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
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            if (!input.content && !input.mediaUrl) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Post must have either content or media",
                })
            }

            const post = await db.post.create({
                data: {
                    userId: user.id,
                    content: input.content,
                    mediaUrl: input.mediaUrl,
                    eventId: input.eventId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            picture: true,
                        }
                    },
                    event: input.eventId ? {
                        select: {
                            id: true,
                            title: true,
                            locationName: true,
                        }
                    } : false,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                }
            })

            return post
        }),

    // Get community feed posts
    getFeed: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            offset: z.number().min(0).default(0),
            eventId: z.number().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { limit, offset, eventId } = input

            const where: any = {}
            if (eventId) where.eventId = eventId

            const posts = await db.post.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            picture: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            title: true,
                            locationName: true,
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            })

            return posts
        }),

    // Like/unlike a post
    toggleLike: protectedProcedure
        .input(z.object({
            postId: z.number(),
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
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Check if post exists
            const post = await db.post.findUnique({
                where: { id: input.postId }
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            // Check if already liked
            const existingLike = await db.postLike.findUnique({
                where: {
                    postId_userId: {
                        postId: input.postId,
                        userId: user.id
                    }
                }
            })

            if (existingLike) {
                // Unlike
                await db.postLike.delete({
                    where: { id: existingLike.id }
                })
                return { liked: false }
            } else {
                // Like
                await db.postLike.create({
                    data: {
                        postId: input.postId,
                        userId: user.id,
                    }
                })
                return { liked: true }
            }
        }),

    // Add a comment to a post
    addComment: protectedProcedure
        .input(z.object({
            postId: z.number(),
            commentText: z.string().min(1).max(500),
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
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Check if post exists
            const post = await db.post.findUnique({
                where: { id: input.postId }
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            const comment = await db.postComment.create({
                data: {
                    postId: input.postId,
                    userId: user.id,
                    commentText: input.commentText,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            picture: true,
                        }
                    }
                }
            })

            return comment
        }),

    // Get comments for a post
    getComments: protectedProcedure
        .input(z.object({
            postId: z.number(),
            limit: z.number().min(1).max(50).default(10),
            offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
            const { postId, limit, offset } = input

            const comments = await db.postComment.findMany({
                where: { postId },
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
                orderBy: { commentedAt: 'asc' },
                take: limit,
                skip: offset,
            })

            return comments
        }),

    // Delete a post (only by creator)
    deletePost: protectedProcedure
        .input(z.object({
            postId: z.number(),
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
                where: { kindeId }
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                })
            }

            // Check if post exists and user owns it
            const post = await db.post.findUnique({
                where: { id: input.postId }
            })

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post not found",
                })
            }

            if (post.userId !== user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only delete your own posts",
                })
            }

            await db.post.delete({
                where: { id: input.postId }
            })

            return { success: true }
        }),
})
