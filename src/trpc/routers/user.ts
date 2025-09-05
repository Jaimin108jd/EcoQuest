import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";


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
    getProfileImage: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user?.id;
        if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User Id Not Found!" });

        const user = await ctx.db.user.findUnique({
            where: {
                kindeId: userId
            },
            select: {
                picture: true
            }
        });

        if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User profile not found" });
        }

        return user;
    })
});