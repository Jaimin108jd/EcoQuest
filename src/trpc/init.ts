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
    return {
        user,
        db: prisma,
        isAuthed: isAuthed
    }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson
})

const isAuthed = t.middleware(({ next, ctx }) => {
    if (!ctx.isAuthed) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource",
        })
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
        },
    })
})
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);