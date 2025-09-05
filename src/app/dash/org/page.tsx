import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { OrganizerDashboardClient } from "@/components/dashboard/organizer-dashboard-client"
import db from "@/lib/db"

export default async function OrganizerDashboardPage() {
    // Server-side authentication check
    const { isAuthenticated, getUser } = getKindeServerSession()
    const isAuthed = await isAuthenticated()

    if (!isAuthed) {
        redirect("/auth/login")
    }

    const kindeUser = await getUser()
    if (!kindeUser?.email) {
        redirect("/auth/login")
    }

    // Fetch user data from database
    const user = await db.user.findFirst({
        where: { email: kindeUser.email },
        include: {
            ngo: true
        }
    })

    if (!user) {
        redirect("/onboard")
    }

    if (!user.isOnBoarded) {
        redirect("/onboard")
    }

    if (user.role !== "ORGANISER") {
        redirect("/dash/usr")
    }

    // Server-side user data for layout
    const userName = `${user.firstName} ${user.lastName}`
    const ngoName = user.ngo?.name

    return (
        <DashboardLayout
            userRole={user.role}
            userName={userName}
            ngoName={ngoName}
        >
            <OrganizerDashboardClient />
        </DashboardLayout>
    )
}