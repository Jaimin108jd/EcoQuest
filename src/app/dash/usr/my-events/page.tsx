import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserMyEventsClient } from "@/components/dashboard/user-my-events-client"
import db from "@/lib/db"

export default async function UserMyEventsPage() {
    const { isAuthenticated, getUser } = getKindeServerSession()
    const isAuthed = await isAuthenticated()

    if (!isAuthed) {
        redirect("/auth/login")
    }

    const kindeUser = await getUser()
    if (!kindeUser?.email) {
        redirect("/auth/login")
    }

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

    if (user.role === "ORGANISER") {
        redirect("/dash/org")
    }

    const userName = `${user.firstName} ${user.lastName}`

    return (
        <DashboardLayout
            userRole={user.role}
            userName={userName}
        >
            <UserMyEventsClient user={user} />
        </DashboardLayout>
    )
}
