import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import UserDashboard from '@/components/dashboard/user-dashboard'

export default async function Dashboard() {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
        redirect('/auth/login')
    }

    return (
        <UserDashboard user={{
            id: user.id,
            email: user.email || '',
            kindeId: user.id,
            given_name: user.given_name || undefined,
            picture: user.picture || undefined
        }} />
    )
}

