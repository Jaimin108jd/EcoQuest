import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { OrganizerEventDetailsClient } from "@/components/organizer/organizer-event-details-client"
import db from "@/lib/db"

interface OrganizerEventDetailsPageProps {
    params: {
        id: string
    }
}

export default async function OrganizerEventDetailsPage({ params }: OrganizerEventDetailsPageProps) {
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

    if (user.role !== "ORGANISER") {
        redirect("/dash/usr")
    }

    const eventId = parseInt(params.id)
    if (isNaN(eventId)) {
        redirect("/dash/org")
    }

    // Verify the organizer owns this event
    const event = await db.event.findFirst({
        where: {
            id: eventId,
            creatorId: user.id
        },
        select: {
            id: true,
            title: true
        }
    })

    if (!event) {
        redirect("/dash/org")
    }

    const userName = `${user.firstName} ${user.lastName}`
    const ngoName = user.ngo?.name

    return (
        <DashboardLayout
            userRole={user.role}
            userName={userName}
            ngoName={ngoName}
        >
            <OrganizerEventDetailsClient eventId={eventId} />
        </DashboardLayout>
    )
}
