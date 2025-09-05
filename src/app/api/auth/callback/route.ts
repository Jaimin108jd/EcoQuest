
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";


export async function GET() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user == null || !user.id)
        throw new Error("something went wrong with authentication" + user);

    let dbUser = await prisma.user.findUnique({
        where: { kindeId: user.id }
    });

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                kindeId: user.id as string,
                firstName: user.given_name as string, // Given Name -> First Name
                lastName: user.family_name as string, // Family Name -> Last Name
                email: user.email as string // Using nullish coalescing operator to provide a default empty string value, tho it shouldnt be empty at all
            }
        });
    }
    // Guard for onboarding.
    if (!dbUser?.isOnBoarded) return NextResponse.redirect("http://localhost:3000/onboard");
    return NextResponse.redirect("http://localhost:3000/dashboard");
}