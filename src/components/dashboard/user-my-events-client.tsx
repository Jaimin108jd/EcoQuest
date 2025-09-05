"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar,
    MapPin,
    Users,
    Target,
    Search,
    Clock,
    Trophy,
    Eye,
    CheckCircle,
    ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
    latitude?: number | null
    longitude?: number | null
    locationName?: string | null
}

interface UserMyEventsClientProps {
    user: User
}

function MyEventCard({
    event,
    registration,
    onUnregister,
    isLoading = false
}: {
    event: any
    registration: any
    onUnregister: () => void
    isLoading?: boolean
}) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date))
    }

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UPCOMING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'ONGOING': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'COMPLETED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
            case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const isCompleted = event.status === "COMPLETED"
    const isUpcoming = event.status === "UPCOMING"

    return (
        <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-200">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-white text-lg font-semibold line-clamp-1">
                            {event.title}
                        </CardTitle>
                        <p className="text-white/70 text-sm mt-1">
                            by {event.ngo.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${getStatusColor(event.status)} border`}>
                                {event.status.toLowerCase()}
                            </Badge>
                            {registration.attended && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Attended
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-white/80 text-sm line-clamp-2">
                    {event.description}
                </p>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)} at {formatTime(event.startTime)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.locationName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{event._count.registrations} registered</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Target className="h-4 w-4" />
                        <span>Target: {event.wasteTargetKg}kg waste</span>
                    </div>

                    {/* Registration Info */}
                    <div className="bg-[#01DE82]/10 rounded-lg p-3 border border-[#01DE82]/20">
                        <div className="flex items-center gap-2 text-[#01DE82] text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Registered on {formatDate(registration.createdAt)}</span>
                        </div>
                        {registration.joinCode && (
                            <div className="mt-1 text-white/70 text-sm">
                                Join Code: <span className="font-mono font-bold text-[#01DE82]">{registration.joinCode}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Link href={`/events/${event.id}`} className="flex-1">
                        <Button
                            variant="outline"
                            className="w-full border-[#01DE82]/40 text-[#01DE82] hover:bg-[#01DE82]/10"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>

                    {isCompleted && registration.attended && (
                        <Link href={`/events/${event.id}/participation`} className="flex-1">
                            <Button
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-semibold"
                            >
                                <Trophy className="h-4 w-4 mr-2" />
                                View Results
                            </Button>
                        </Link>
                    )}

                    {isUpcoming && (
                        <Button
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            onClick={onUnregister}
                            disabled={isLoading}
                        >
                            {isLoading ? "Unregistering..." : "Unregister"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function UserMyEventsClient({ user }: UserMyEventsClientProps) {
    const [activeTab, setActiveTab] = useState("upcoming")
    const [searchQuery, setSearchQuery] = useState("")

    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
        ...trpc.eventRegistration.myRegistrations.queryOptions({
            limit: 100
        }),
    })

    const { data: participations = [], isLoading: participationsLoading } = useQuery({
        ...trpc.eventParticipation.myParticipations.queryOptions({
            limit: 100
        }),
    })

    const unregisterMutation = useMutation({
        ...trpc.eventRegistration.unregister.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully unregistered from event")
            queryClient.invalidateQueries({ queryKey: trpc.eventRegistration.myRegistrations.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to unregister from event")
        }
    })

    const handleUnregister = (eventId: number) => {
        unregisterMutation.mutate({ eventId })
    }

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = !searchQuery ||
            reg.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.event.locationName.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
    })

    const getEventsByTab = () => {
        switch (activeTab) {
            case "upcoming":
                return filteredRegistrations.filter(r => r.event.status === "UPCOMING")
            case "completed":
                return filteredRegistrations.filter(r => r.event.status === "COMPLETED")
            case "all":
                return filteredRegistrations
            default:
                return []
        }
    }

    const tabCounts = {
        upcoming: registrations.filter(r => r.event.status === "UPCOMING").length,
        completed: registrations.filter(r => r.event.status === "COMPLETED").length,
        all: registrations.length
    }

    const stats = {
        totalRegistrations: registrations.length,
        upcomingEvents: registrations.filter(r => r.event.status === "UPCOMING").length,
        completedEvents: registrations.filter(r => r.event.status === "COMPLETED").length,
        totalParticipations: participations.length
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Events</h1>
                    <p className="text-white/70 mt-1">
                        Manage your registered and completed events
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#01DE82]/10">
                                <Calendar className="h-4 w-4 text-[#01DE82]" />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs">Total Registered</p>
                                <p className="text-lg font-bold text-[#01DE82]">{stats.totalRegistrations}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-blue-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Clock className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs">Upcoming</p>
                                <p className="text-lg font-bold text-blue-400">{stats.upcomingEvents}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-green-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Trophy className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs">Completed</p>
                                <p className="text-lg font-bold text-green-400">{stats.completedEvents}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-purple-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <CheckCircle className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white/70 text-xs">Participated</p>
                                <p className="text-lg font-bold text-purple-400">{stats.totalParticipations}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                <CardHeader>
                    <CardTitle className="text-white text-xl">My Registered Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <Input
                            placeholder="Search your events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-[#020E0E]/50 border-[#01DE82]/30 text-white"
                        />
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-[#020E0E]/50 border border-[#01DE82]/20">
                            <TabsTrigger
                                value="upcoming"
                                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-white"
                            >
                                Upcoming ({tabCounts.upcoming})
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white"
                            >
                                Completed ({tabCounts.completed})
                            </TabsTrigger>
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white"
                            >
                                All Events ({tabCounts.all})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            {(registrationsLoading) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Card key={i} className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                                            <CardHeader>
                                                <Skeleton className="h-6 w-3/4 bg-[#01DE82]/20" />
                                                <Skeleton className="h-4 w-1/2 bg-[#01DE82]/20" />
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <Skeleton className="h-4 w-full bg-[#01DE82]/20" />
                                                <Skeleton className="h-4 w-3/4 bg-[#01DE82]/20" />
                                                <Skeleton className="h-10 w-full bg-[#01DE82]/20" />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {getEventsByTab().map((registration: any) => (
                                        <MyEventCard
                                            key={registration.id}
                                            event={registration.event}
                                            registration={registration}
                                            onUnregister={() => handleUnregister(registration.event.id)}
                                            isLoading={unregisterMutation.isPending}
                                        />
                                    ))}
                                </div>
                            )}

                            {!registrationsLoading && getEventsByTab().length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-white/50 text-lg">
                                        {activeTab === "upcoming" && "No upcoming events"}
                                        {activeTab === "completed" && "No completed events"}
                                        {activeTab === "all" && "No registered events"}
                                    </div>
                                    <p className="text-white/30 text-sm mt-2">
                                        {activeTab === "upcoming" && "Register for events to see them here"}
                                        {activeTab === "completed" && "Complete some events to see them here"}
                                        {activeTab === "all" && "Start by discovering and registering for events"}
                                    </p>
                                    <Link href="/dash/usr/events">
                                        <Button className="mt-4 bg-gradient-to-r from-[#01DE82] to-[#00B86B] text-black font-semibold">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Discover Events
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
