import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getKindeServerSession, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'

export default async function Dashboard() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    return (
        <main className='flex min-h-screen flex-col items-center justify-between p-24'>
            <div className='bg-white shadow-md rounded-lg p-6 w-full max-w-4xl'>
                <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
                {user ? (
                    <div className='space-y-2'>
                        <p className='text-gray-700'>Welcome, {user.given_name || user.email}</p>
                        <div className='border-t pt-2 mt-4'>
                            <p className='text-sm text-gray-500'>Logged in as: {user.email}</p>
                            <Avatar>
                                <AvatarImage src={user.picture ?? ''} alt={user.given_name ?? ''} />
                                <AvatarFallback>
                                    {user.given_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <LogoutLink>
                                <Button className='bg-red-500 hover:bg-red-600 text-white mt-4'>
                                    Logout
                                </Button>
                            </LogoutLink>
                        </div>
                    </div>
                ) : (
                    <p className='text-gray-700'>Loading user information...</p>
                )}
            </div>
        </main>
    )
}

