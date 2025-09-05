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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Calendar,
    MapPin,
    Users,
    Target,
    Search,
    Filter,
    Clock,
    Trophy,
    Eye,
    Globe,
    Navigation
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

interface UserEventsClientProps {
    user: User
}

interface Event {
    id: number
    title: string
    description: string
    latitude: number
    longitude: number
    locationName: string
    date: Date
    startTime: Date
    endTime?: Date | null
    wasteTargetKg: number
    status: string
    joinCode: string
    creator: {
        id: number
        firstName: string
        lastName: string
        email: string
    }
    ngo: {
        id: number
        name: string
    }
    _count: {
        registrations: number
    }
    distance?: number
}

function EventCard({
    event,
    onRegister,
    onUnregister,
    isRegistered = false,
    isLoading = false
}: {
    event: Event
    onRegister: () => void
    onUnregister: () => void
    isRegistered?: boolean
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
                    </div>
                    <Badge className={`${getStatusColor(event.status)} border`}>
                        {event.status.toLowerCase()}
                    </Badge>
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
                        {event.distance && (
                            <span className="text-[#01DE82] font-medium">
                                ({event.distance.toFixed(1)}km away)
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{event._count.registrations} registered</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Target className="h-4 w-4" />
                        <span>Target: {event.wasteTargetKg}kg waste</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Link href={`/dash/usr/events/${event.id}`} className="flex-1">
                        <Button
                            variant="outline"
                            className="w-full border-[#01DE82]/40 text-[#01DE82] hover:bg-[#01DE82]/10"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    </Link>

                    {event.status === "UPCOMING" && (
                        <div className="flex-1">
                            {isRegistered ? (
                                <Button
                                    variant="outline"
                                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
                                    onClick={onUnregister}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Unregistering..." : "Unregister"}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full bg-gradient-to-r from-[#01DE82] to-[#00B86B] hover:from-[#00B86B] hover:to-[#01DE82] text-black font-semibold"
                                    onClick={onRegister}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Registering..." : "Register"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function UserEventsClient({ user }: UserEventsClientProps) {
    const [activeTab, setActiveTab] = useState("discover")
    const [radiusKm, setRadiusKm] = useState(500)
    const [searchQuery, setSearchQuery] = useState("")

    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const userLatitude = user.latitude || 19.0760
    const userLongitude = user.longitude || 72.8777

    const { data: nearbyEvents = [], isLoading: nearbyLoading } = useQuery({
        ...trpc.events.nearby.queryOptions({
            userLatitude,
            userLongitude,
            radiusKm,
            status: "UPCOMING", // Always show only upcoming events in discover
            limit: 50
        }),
    })

    const { data: allEvents = [], isLoading: allEventsLoading } = useQuery({
        ...trpc.events.list.queryOptions({
            status: "UPCOMING", // Always show only upcoming events in discover
            limit: 100
        }),
        enabled: radiusKm >= 500,
    })

    const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
        ...trpc.eventRegistration.myRegistrations.queryOptions({
            limit: 50
        }),
    })

    const registerMutation = useMutation({
        ...trpc.eventRegistration.register.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully registered for event!")
            queryClient.invalidateQueries({ queryKey: trpc.eventRegistration.myRegistrations.queryKey() })
            queryClient.invalidateQueries({ queryKey: trpc.events.nearby.queryKey() })
            queryClient.invalidateQueries({ queryKey: trpc.events.list.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to register for event")
        }
    })

    const unregisterMutation = useMutation({
        ...trpc.eventRegistration.unregister.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully unregistered from event")
            queryClient.invalidateQueries({ queryKey: trpc.eventRegistration.myRegistrations.queryKey() })
            queryClient.invalidateQueries({ queryKey: trpc.events.nearby.queryKey() })
            queryClient.invalidateQueries({ queryKey: trpc.events.list.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to unregister from event")
        }
    })

    const handleRegister = (eventId: number) => {
        registerMutation.mutate({ eventId })
    }

    const handleUnregister = (eventId: number) => {
        unregisterMutation.mutate({ eventId })
    }

    const registeredEventIds = new Set(registrations.map(r => r.event.id))
    const eventsToShow = radiusKm >= 500 ? allEvents : nearbyEvents
    const eventsLoading = radiusKm >= 500 ? allEventsLoading : nearbyLoading

    const filteredEvents = eventsToShow.filter(event =>
    (!searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.locationName.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const getEventsByTab = () => {
        switch (activeTab) {
            case "discover":
                return filteredEvents
            case "registered":
                return registrations
                    .filter(r => r.event.status === "UPCOMING")
                    .map(r => r.event)
                    .filter(event =>
                        !searchQuery ||
                        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.locationName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
            case "completed":
                return registrations
                    .filter(r => r.event.status === "COMPLETED")
                    .map(r => r.event)
                    .filter(event =>
                        !searchQuery ||
                        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.locationName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
            default:
                return []
        }
    }

    const tabCounts = {
        discover: filteredEvents.length,
        registered: registrations.filter(r => r.event.status === "UPCOMING").length,
        completed: registrations.filter(r => r.event.status === "COMPLETED").length
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Events</h1>
                    <p className="text-white/70 mt-1">
                        Discover upcoming environmental cleanup events and manage your registrations
                    </p>
                </div>
            </div>

            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                <CardHeader>
                    <CardTitle className="text-white text-xl">Browse Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <Label className="text-white mb-2 block">Search Events</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                                <Input
                                    placeholder="Search by title, description, location, or organization..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/40"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-48">
                                <Label className="text-white mb-2 block">Distance Range</Label>
                                <Select value={radiusKm.toString()} onValueChange={(value) => setRadiusKm(parseInt(value))}>
                                    <SelectTrigger className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white">
                                        <div className="flex items-center gap-2">
                                            {radiusKm >= 500 ? (
                                                <Globe className="h-4 w-4 text-[#01DE82]" />
                                            ) : (
                                                <Navigation className="h-4 w-4 text-[#01DE82]" />
                                            )}
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#020E0E] border-[#01DE82]/30">
                                        <SelectItem value="5" className="text-white hover:bg-[#01DE82]/10">
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-3 w-3" />
                                                <span>5km - Very Close</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="10" className="text-white hover:bg-[#01DE82]/10">
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-3 w-3" />
                                                <span>10km - Nearby</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="25" className="text-white hover:bg-[#01DE82]/10">
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-3 w-3" />
                                                <span>25km - Local Area</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="50" className="text-white hover:bg-[#01DE82]/10">
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-3 w-3" />
                                                <span>50km - City Wide</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="100" className="text-white hover:bg-[#01DE82]/10">
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-3 w-3" />
                                                <span>100km - Regional</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="250" className="text-white hover:bg-[#01DE82]/10">
                                            <div className="flex items-center gap-2">
                                                <Navigation className="h-3 w-3" />
                                                <span>250km - State Wide</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="500" className="text-white hover:bg-[#01DE82]/10">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-3 w-3" />
                                                <span>Global - All Events</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>



                    {/* Active Filters Summary */}
                    {(searchQuery || radiusKm !== 50) && (
                        <div className="bg-[#01DE82]/5 border border-[#01DE82]/20 rounded-lg p-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-white/70 text-sm">Active filters:</span>

                                {searchQuery && (
                                    <Badge variant="outline" className="border-[#01DE82]/40 text-[#01DE82] bg-[#01DE82]/10">
                                        Search: "{searchQuery}"
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto w-auto p-0 ml-2 hover:bg-transparent"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            ×
                                        </Button>
                                    </Badge>
                                )}

                                {radiusKm !== 50 && (
                                    <Badge variant="outline" className="border-blue-400/40 text-blue-400 bg-blue-400/10">
                                        Distance: {radiusKm >= 500 ? "Global" : `${radiusKm}km`}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto w-auto p-0 ml-2 hover:bg-transparent"
                                            onClick={() => setRadiusKm(50)}
                                        >
                                            ×
                                        </Button>
                                    </Badge>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setRadiusKm(50)
                                    }}
                                    className="text-white/60 hover:text-white hover:bg-[#01DE82]/10 ml-auto"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-[#020E0E]/50 border border-[#01DE82]/20">
                            <TabsTrigger
                                value="discover"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white"
                            >
                                Discover Upcoming ({tabCounts.discover})
                            </TabsTrigger>
                            <TabsTrigger
                                value="registered"
                                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-white"
                            >
                                My Upcoming ({tabCounts.registered})
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white"
                            >
                                Completed ({tabCounts.completed})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            {(eventsLoading || registrationsLoading) ? (
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
                                    {getEventsByTab().map((event: any) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            onRegister={() => handleRegister(event.id)}
                                            onUnregister={() => handleUnregister(event.id)}
                                            isRegistered={registeredEventIds.has(event.id)}
                                            isLoading={registerMutation.isPending || unregisterMutation.isPending}
                                        />
                                    ))}
                                </div>
                            )}

                            {!eventsLoading && !registrationsLoading && getEventsByTab().length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-white/50 text-lg">
                                        {activeTab === "discover" && "No events found"}
                                        {activeTab === "registered" && "No registered events"}
                                        {activeTab === "completed" && "No completed events"}
                                    </div>
                                    <p className="text-white/30 text-sm mt-2">
                                        {activeTab === "discover" && "Try adjusting your search or filters"}
                                        {activeTab === "registered" && "Browse discover tab to find events"}
                                        {activeTab === "completed" && "Complete some events to see them here"}
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
