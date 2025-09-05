"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
    Calendar,
    MapPin,
    Users,
    Target,
    Navigation,
    Eye
} from "lucide-react"
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

interface UserMapClientProps {
    user: User
}

function EventMapCard({ event }: { event: any }) {
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
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-white text-sm font-semibold line-clamp-1">
                            {event.title}
                        </CardTitle>
                        <p className="text-white/70 text-xs mt-1">
                            by {event.ngo.name}
                        </p>
                    </div>
                    <Badge className={`${getStatusColor(event.status)} border text-xs`}>
                        {event.status.toLowerCase()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/70 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{event.locationName}</span>
                    </div>

                    {event.distance && (
                        <div className="flex items-center gap-2 text-[#01DE82] text-xs font-medium">
                            <Navigation className="h-3 w-3" />
                            <span>{event.distance.toFixed(1)}km away</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-white/70 text-xs">
                        <Users className="h-3 w-3" />
                        <span>{event._count.registrations} registered</span>
                    </div>
                </div>

                <Link href={`/events/${event.id}`}>
                    <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-[#01DE82] to-[#00B86B] hover:from-[#00B86B] hover:to-[#01DE82] text-black font-semibold text-xs"
                    >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

export function UserMapClient({ user }: UserMapClientProps) {
    const [radiusKm, setRadiusKm] = useState(25)
    const trpc = useTRPC()

    const userLatitude = user.latitude || 19.0760
    const userLongitude = user.longitude || 72.8777

    const { data: nearbyEvents = [], isLoading: nearbyLoading } = useQuery({
        ...trpc.events.nearby.queryOptions({
            userLatitude,
            userLongitude,
            radiusKm,
            status: "UPCOMING",
            limit: 20
        }),
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Map View</h1>
                    <p className="text-white/70 mt-1">
                        Discover events near you with interactive map
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Placeholder */}
                <div className="lg:col-span-2">
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 h-[600px]">
                        <CardContent className="p-6 h-full">
                            <div className="h-full bg-gradient-to-br from-[#01DE82]/10 to-[#00B86B]/10 rounded-lg border border-[#01DE82]/20 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="h-16 w-16 text-[#01DE82] mx-auto mb-4" />
                                    <h3 className="text-white text-xl font-semibold mb-2">Interactive Map</h3>
                                    <p className="text-white/70 mb-4">
                                        Map integration coming soon! <br />
                                        View nearby events in the sidebar for now.
                                    </p>
                                    <div className="bg-[#01DE82]/20 rounded-lg p-4 inline-block">
                                        <p className="text-[#01DE82] text-sm">
                                            📍 Your location: {user.locationName || "Mumbai, India"}
                                        </p>
                                        <p className="text-white/70 text-xs mt-1">
                                            Radius: {radiusKm}km • {nearbyEvents.length} events found
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar with events */}
                <div className="space-y-6">
                    {/* Distance Control */}
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Navigation className="h-5 w-5 text-[#01DE82]" />
                                Search Radius
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-white mb-2 block">
                                    Distance: {radiusKm}km
                                </Label>
                                <Slider
                                    value={[radiusKm]}
                                    onValueChange={(value: number[]) => setRadiusKm(value[0])}
                                    max={100}
                                    min={1}
                                    step={1}
                                    className="mt-2"
                                />
                            </div>
                            <div className="text-center">
                                <Badge className="bg-[#01DE82]/20 text-[#01DE82] border-[#01DE82]/30">
                                    {nearbyEvents.length} events found
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nearby Events */}
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Nearby Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                            {nearbyLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <Card key={i} className="bg-[#020E0E]/40 border-[#01DE82]/10">
                                        <CardContent className="p-3 space-y-2">
                                            <Skeleton className="h-4 w-3/4 bg-[#01DE82]/20" />
                                            <Skeleton className="h-3 w-1/2 bg-[#01DE82]/20" />
                                            <Skeleton className="h-6 w-full bg-[#01DE82]/20" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : nearbyEvents.length === 0 ? (
                                <div className="text-center py-8">
                                    <MapPin className="h-12 w-12 text-white/30 mx-auto mb-2" />
                                    <p className="text-white/50">No events found in this area</p>
                                    <p className="text-white/30 text-sm">Try increasing the search radius</p>
                                </div>
                            ) : (
                                nearbyEvents.map((event: any) => (
                                    <EventMapCard key={event.id} event={event} />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Events in {radiusKm}km</span>
                                <span className="text-[#01DE82] font-bold">{nearbyEvents.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Total participants</span>
                                <span className="text-[#01DE82] font-bold">
                                    {nearbyEvents.reduce((sum, event) => sum + event._count.registrations, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-sm">Closest event</span>
                                <span className="text-[#01DE82] font-bold">
                                    {nearbyEvents.length > 0 ? `${nearbyEvents[0]?.distance?.toFixed(1) || 0}km` : "N/A"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
