import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { PrismaClient } from "@/generated/prisma"
import { headers } from "next/headers"

const prisma = new PrismaClient()
export const createTRPCContext = async (opts: { headers: Headers }) => {
    const { isAuthenticated, getUser } = getKindeServerSession();
    const user = await getUser();
    const isAuthed = await isAuthenticated();

    console.log("TRPC Context - isAuthed:", isAuthed);
    console.log("TRPC Context - user:", user ? { id: user.id, email: user.email } : null);

    return {
        user,
        db: prisma,
        isAuthed: isAuthed
    }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson
})

const isAuthed = t.middleware(async ({ next, ctx }) => {
    console.log("Auth middleware - isAuthed:", ctx.isAuthed);
    console.log("Auth middleware - user:", ctx.user ? { id: ctx.user.id, email: ctx.user.email } : null);

    if (!ctx.isAuthed) {
        console.log("Auth middleware - User not authenticated");
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        })
    }

    if (!ctx.user?.id) {
        console.log("Auth middleware - No user ID found");
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid user session",
        })
    }

    console.log("Auth middleware - Looking up user with kindeId:", ctx.user.id);
    const dbUser = await prisma.user.findUnique({
        where: { kindeId: ctx.user.id }
    });

    console.log("Auth middleware - dbUser found:", dbUser ? { id: dbUser.id, email: dbUser.email } : null);

    if (!dbUser) {
        console.log("Auth middleware - User not found in database");
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found in database",
        })
    }

    return next({
        ctx: {
            ...ctx,
            dbUser
        },
    })
})
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);