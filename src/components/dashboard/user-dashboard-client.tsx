"use client";

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
    Calendar,
    MapPin,
    Users,
    Target,
    Search,
    Filter,
    Clock,
    Trophy,
    QrCode,
    Eye,
    Activity,
    ArrowRight,
    Award,
    Medal,
    Crown,
    Star,
    TrendingUp,
    Zap,
    ChevronDown,
    Plus
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Leaderboard } from "./leaderboard"

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

interface UserDashboardClientProps {
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

interface DashboardStatsProps {
    registeredEvents: number
    completedEvents: number
    totalWasteCollected: number
    upcomingEvents: number
    totalXP?: number
    currentLevel?: number
    currentStreak?: number
    totalParticipations?: number
    isLoading?: boolean
}

function XPProgressCard({ userXP, participationStats, isLoading }: { userXP: any, participationStats: any, isLoading: boolean }) {
    // Calculate level and XP correctly
    const totalXP = userXP?.totalXP || 0
    const currentLevel = userXP?.currentLevel || 1

    // XP required for current level (Level N requires N * 100 total XP)
    const xpForCurrentLevel = (currentLevel - 1) * 100
    const xpForNextLevel = currentLevel * 100

    // Current progress within the level
    const currentLevelXP = totalXP - xpForCurrentLevel
    const xpNeededForNext = Math.max(0, xpForNextLevel - totalXP)

    // Progress percentage for current level (handle case where user has reached next level)
    const progressPercentage = currentLevelXP >= 100 ? 100 : (currentLevelXP / 100) * 100

    return (
        <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#00B86B]/10 border-[#01DE82]/30 backdrop-blur-xl">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-400" />
                        Level Progress
                    </CardTitle>
                    <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        Level {currentLevel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full bg-white/10" />
                        <Skeleton className="h-2 w-full bg-white/10" />
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between text-sm text-white/70">
                            <span>{Math.min(currentLevelXP, 100)} XP</span>
                            <span>{xpNeededForNext > 0 ? `${xpNeededForNext} XP to next level` : 'Level completed!'}</span>
                        </div>
                        <Progress
                            value={Math.max(0, Math.min(100, progressPercentage))}
                            className="h-3 bg-[#020E0E]/50 [&>div]:bg-gradient-to-r [&>div]:from-[#01DE82] [&>div]:to-[#00B86B]"
                        />
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-[#01DE82]">
                                    {totalXP}
                                </p>
                                <p className="text-xs text-white/70">Total XP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">
                                    {(participationStats?.totalWasteCollected || 0).toFixed(1)}kg
                                </p>
                                <p className="text-xs text-white/70">Waste Collected</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

function RecentActivitiesCard({ activities, isLoading }: { activities: any[], isLoading: boolean }) {
    return (
        <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-[#01DE82]" />
                        Recent Activities
                    </CardTitle>
                    <Link href="/dash/usr/history">
                        <Button variant="ghost" size="sm" className="text-[#01DE82] hover:bg-[#01DE82]/10">
                            <Eye className="h-4 w-4 mr-1" />
                            View All
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                                    <Skeleton className="h-3 w-1/2 bg-white/10" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-white/30 mx-auto mb-2" />
                        <p className="text-white/50">No recent activities</p>
                        <p className="text-white/30 text-sm">Participate in events to see activities here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.slice(0, 3).map((activity: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#01DE82]/5 border border-[#01DE82]/10">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-[#01DE82]/20 flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-[#01DE82]" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium">
                                        {activity.event?.title ? `Participated in "${activity.event.title}"` : "Event Participation"}
                                    </p>
                                    <p className="text-white/60 text-xs">
                                        {activity.wasteCollectedKg ? `Collected ${activity.wasteCollectedKg}kg of waste` : "Participated in cleanup event"}
                                    </p>
                                    <p className="text-[#01DE82] text-xs mt-1">
                                        +{activity.xpEarned || 10} XP
                                        {activity.bonusXP && activity.bonusXP > 0 && (
                                            <span className="text-yellow-400 ml-1">
                                                (+{activity.bonusXP} bonus)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-white/40 text-xs">
                                    {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() :
                                        activity.event?.date ? new Date(activity.event.date).toLocaleDateString() : "Recent"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function DashboardStats({
    registeredEvents,
    completedEvents,
    totalWasteCollected,
    upcomingEvents,
    totalXP,
    currentLevel,
    currentStreak,
    totalParticipations,
    isLoading
}: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Events Stats */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        Events
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-16 bg-white/10" />
                            <Skeleton className="h-4 w-24 bg-white/10" />
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold text-blue-400">
                                {registeredEvents}
                            </div>
                            <div className="text-white/70 text-sm">
                                Registered • {upcomingEvents} upcoming
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Completed Events */}
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-green-400" />
                        Completed
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-16 bg-white/10" />
                            <Skeleton className="h-4 w-24 bg-white/10" />
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold text-green-400">
                                {completedEvents}
                            </div>
                            <div className="text-white/70 text-sm">
                                Events completed
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Waste Collected */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-400" />
                        Impact
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-16 bg-white/10" />
                            <Skeleton className="h-4 w-24 bg-white/10" />
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold text-purple-400">
                                {totalWasteCollected.toFixed(1)}
                            </div>
                            <div className="text-white/70 text-sm">
                                kg waste collected
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Level & XP */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 backdrop-blur-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        Level
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-8 w-16 bg-white/10" />
                            <Skeleton className="h-4 w-24 bg-white/10" />
                        </>
                    ) : (
                        <>
                            <div className="text-3xl font-bold text-yellow-400">
                                {currentLevel}
                            </div>
                            <div className="text-white/70 text-sm">
                                {totalXP} total XP
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function EventCard({ event, onRegister, onUnregister, isRegistered, isLoading }: {
    event: Event
    onRegister: () => void
    onUnregister: () => void
    isRegistered: boolean
    isLoading: boolean
}) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Link href={`/events/${event.id}`}>
            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#01DE82]/10 cursor-pointer group">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-white text-lg group-hover:text-[#01DE82] transition-colors line-clamp-2">
                                {event.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-[#01DE82]/20 text-[#01DE82] border-[#01DE82]/30">
                                    {event.ngo.name}
                                </Badge>
                                {event.distance && (
                                    <Badge variant="outline" className="text-white/70 border-white/30">
                                        {event.distance.toFixed(1)}km away
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-white/70 text-sm line-clamp-2">
                        {event.description}
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(event.startTime)}</span>
                            {event.endTime && (
                                <span>- {formatTime(event.endTime)}</span>
                            )}
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
                    </div>

                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (isRegistered) {
                                onUnregister()
                            } else {
                                onRegister()
                            }
                        }}
                        disabled={isLoading}
                        className={
                            isRegistered
                                ? "w-full bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:border-red-500/60"
                                : "w-full bg-gradient-to-r from-[#01DE82]/20 to-[#00B86B]/20 border border-[#01DE82]/40 text-[#01DE82] hover:from-[#01DE82]/30 hover:to-[#00B86B]/30 hover:border-[#01DE82]/60 hover:text-white transition-all duration-300"
                        }
                    >
                        {isLoading ? (
                            "Loading..."
                        ) : isRegistered ? (
                            "Unregister"
                        ) : (
                            "Join Event"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </Link>
    )
}

function JoinEventDialog() {
    const [joinCode, setJoinCode] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const joinMutation = useMutation({
        ...trpc.eventRegistration.joinEvent.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully joined event!")
            setJoinCode("")
            setIsOpen(false)
            queryClient.invalidateQueries({ queryKey: trpc.eventRegistration.myRegistrations.queryKey() })
            queryClient.invalidateQueries({ queryKey: trpc.events.nearby.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to join event")
        }
    })

    const handleJoin = () => {
        if (!joinCode.trim()) {
            toast.error("Please enter a join code")
            return
        }
        joinMutation.mutate({ joinCode: joinCode.trim() })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#01DE82] to-[#00B86B] hover:from-[#01DE82]/90 hover:to-[#00B86B]/90 text-white font-medium shadow-lg shadow-[#01DE82]/20 hover:shadow-xl hover:shadow-[#01DE82]/30 transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Join Event
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-b from-[#020E0E] to-[#001a0f] backdrop-blur-xl border-[#01DE82]/30">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl font-bold flex items-center">
                        <QrCode className="h-5 w-5 mr-2 text-[#01DE82]" />
                        Join Event with Code
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="joinCode" className="text-white/80">
                            Event Join Code
                        </Label>
                        <Input
                            id="joinCode"
                            type="text"
                            placeholder="Enter join code (e.g. ECO123)"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="bg-[#020E0E]/60 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleJoin()
                                }
                            }}
                        />
                    </div>
                    <Button
                        onClick={handleJoin}
                        disabled={joinMutation.isPending}
                        className="w-full bg-gradient-to-r from-[#01DE82] to-[#00B86B] hover:from-[#01DE82]/90 hover:to-[#00B86B]/90 text-white font-medium"
                    >
                        {joinMutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Joining...
                            </>
                        ) : (
                            "Join Event"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function UserDashboardClient({ user }: UserDashboardClientProps) {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [radiusKm, setRadiusKm] = useState(50)
    const [searchQuery, setSearchQuery] = useState("")
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    // Get user statistics and gamification data
    const { data: userStats, isLoading: statsLoading } = useQuery({
        ...trpc.userStats.getStats.queryOptions(),
    })

    // Get user location (default to Mumbai if not set)
    const userLatitude = user.latitude || 19.0760
    const userLongitude = user.longitude || 72.8777

    // Fetch nearby events
    const { data: nearbyEvents = [], isLoading: nearbyLoading } = useQuery({
        ...trpc.events.nearby.queryOptions({
            userLatitude,
            userLongitude,
            radiusKm,
            status: "UPCOMING",
            limit: 50
        }),
        refetchInterval: 30000 // Refetch every 30 seconds for faster updates
    })

    // Fetch all events when radius is large (500km+)
    const { data: allEvents = [], isLoading: allEventsLoading } = useQuery({
        ...trpc.events.list.queryOptions({
            status: "UPCOMING",
            limit: 100
        }),
        enabled: radiusKm >= 500,
        refetchInterval: 30000 // Refetch every 30 seconds
    })

    // Fetch user's registrations
    const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
        ...trpc.eventRegistration.myRegistrations.queryOptions({
            limit: 50
        }),
        refetchInterval: 15000 // Refetch every 15 seconds for faster updates
    })

    // Register for event mutation
    const registerMutation = useMutation({
        ...trpc.eventRegistration.register.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully registered for event!")
            queryClient.invalidateQueries({ queryKey: trpc.eventRegistration.myRegistrations.queryKey() })
            queryClient.invalidateQueries({ queryKey: trpc.events.nearby.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to register for event")
        }
    })

    // Unregister from event mutation
    const unregisterMutation = useMutation({
        ...trpc.eventRegistration.unregister.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully unregistered from event")
            queryClient.invalidateQueries({ queryKey: trpc.eventRegistration.myRegistrations.queryKey() })
            queryClient.invalidateQueries({ queryKey: trpc.events.nearby.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to unregister from event")
        }
    })


    // Choose which events to show based on radius
    const eventsToShow = radiusKm >= 500 ? allEvents : nearbyEvents

    // Filter events based on search
    const filteredNearbyEvents = eventsToShow.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.locationName.toLowerCase().includes(searchQuery.toLowerCase())
    )



    const tabCounts = {
        discover: filteredNearbyEvents.length,
        all: eventsToShow.length,
        registered: registrations.filter(r => r.event.status === "UPCOMING").length,
        completed: registrations.filter(r => r.event.status === "COMPLETED").length
    }

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-white/70 mt-1">
                        Discover and join environmental cleanup events near you
                    </p>
                </div>
            </div>


            <div className="space-y-8">
                {/* Stats Cards */}
                <DashboardStats
                    registeredEvents={userStats?.registrationStats.totalRegistrations || 0}
                    completedEvents={userStats?.registrationStats.completedEvents || 0}
                    totalWasteCollected={userStats?.participationStats.totalWasteCollected || 0}
                    upcomingEvents={userStats?.registrationStats.upcomingEvents || 0}
                    totalXP={userStats?.userXP.totalXP || 0}
                    currentLevel={userStats?.userXP.currentLevel || 1}
                    currentStreak={userStats?.userXP.currentStreak || 0}
                    totalParticipations={userStats?.participationStats.totalParticipations || 0}
                    isLoading={statsLoading}
                />

                {/* Dashboard Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* XP Progress Card */}
                    <XPProgressCard
                        userXP={userStats?.userXP}
                        participationStats={userStats?.participationStats}
                        isLoading={statsLoading}
                    />

                    {/* Recent Activities Card */}
                    <RecentActivitiesCard
                        activities={userStats?.recentActivities || []}
                        isLoading={statsLoading}
                    />
                </div>

                {/* Leaderboard Section */}
                <Leaderboard />

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#01DE82]/10 cursor-pointer group"
                        onClick={() => setActiveTab("discover")}
                    >
                        <CardContent className="p-6 text-center">
                            <Search className="h-8 w-8 text-[#01DE82] mx-auto mb-2" />
                            <h3 className="text-white font-semibold mb-1">Discover Events</h3>
                            <p className="text-white/70 text-sm">Find cleanup events near you</p>
                            <p className="text-[#01DE82] text-lg font-bold mt-2">{tabCounts.discover} nearby</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#01DE82]/10 cursor-pointer group"
                        onClick={() => setActiveTab("registered")}
                    >
                        <CardContent className="p-6 text-center">
                            <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                            <h3 className="text-white font-semibold mb-1">My Events</h3>
                            <p className="text-white/70 text-sm">Events you've registered for</p>
                            <p className="text-blue-400 text-lg font-bold mt-2">{tabCounts.registered} upcoming</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#01DE82]/10 cursor-pointer group"
                        onClick={() => setActiveTab("completed")}
                    >
                        <CardContent className="p-6 text-center">
                            <Trophy className="h-8 w-8 text-green-400 mx-auto mb-2" />
                            <h3 className="text-white font-semibold mb-1">Completed</h3>
                            <p className="text-white/70 text-sm">Events you've participated in</p>
                            <p className="text-green-400 text-lg font-bold mt-2">{tabCounts.completed} completed</p>
                        </CardContent>
                    </Card>
                </div>
            </div>




        </div>
    )
}
