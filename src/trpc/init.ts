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
    if (!ctx.isAuthed) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        })
    }

    if (!ctx.user?.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid user session",
        })
    }

    const dbUser = await prisma.user.findUnique({
        where: { kindeId: ctx.user.id }
    });

    if (!dbUser) {
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