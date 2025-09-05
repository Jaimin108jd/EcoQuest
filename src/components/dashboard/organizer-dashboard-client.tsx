"use client"

import { useState } from "react"
import { Plus, Calendar, Users, Target, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateEventSheet } from "./create-event-sheet"
import { EventGrid } from "./event-components"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface DashboardStatsProps {
    totalEvents: number
    upcomingEvents: number
    totalParticipants: number
    completedEvents: number
    isLoading?: boolean
}

function DashboardStats({
    totalEvents,
    upcomingEvents,
    totalParticipants,
    completedEvents,
    isLoading
}: DashboardStatsProps) {
    const stats = [
        {
            title: "Total Events",
            value: totalEvents,
            icon: Calendar,
            color: "text-[#01DE82]",
            bgColor: "bg-[#01DE82]/10",
            borderColor: "border-[#01DE82]/30"
        },
        {
            title: "Upcoming",
            value: upcomingEvents,
            icon: Clock,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30"
        },
        {
            title: "Participants",
            value: totalParticipants,
            icon: Users,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/30"
        },
        {
            title: "Completed",
            value: completedEvents,
            icon: Target,
            color: "text-green-400",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/30"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon

                return (
                    <Card
                        key={stat.title}
                        className={`bg-[#020E0E]/60 backdrop-blur-xl border ${stat.borderColor} hover:border-opacity-60 transition-colors duration-200`}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-sm font-medium">
                                        {stat.title}
                                    </p>
                                    <div className={`text-3xl font-bold ${stat.color} mt-2`}>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-16 bg-[#01DE82]/20" />
                                        ) : (
                                            stat.value
                                        )}
                                    </div>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

export function OrganizerDashboardClient() {
    const [activeTab, setActiveTab] = useState("all")
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    // Fetch user's events
    const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
        ...trpc.events.myEvents.queryOptions({
            limit: 50
        }),
        refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
    })

    // Calculate stats
    const stats = {
        totalEvents: events.length,
        upcomingEvents: events.filter(e => e.status === "UPCOMING").length,
        totalParticipants: events.reduce((sum, event) => sum + (event._count?.registrations || 0), 0),
        completedEvents: events.filter(e => e.status === "COMPLETED").length
    }

    // Filter events based on active tab
    const filteredEvents = events.filter(event => {
        if (activeTab === "all") return true
        return event.status === activeTab.toUpperCase()
    })

    // Mutations for event actions
    const startEventMutation = useMutation({
        ...trpc.events.startEvent.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.events.myEvents.queryKey() })
            refetchEvents()
        }
    })

    const endEventMutation = useMutation({
        ...trpc.events.endEvent.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.events.myEvents.queryKey() })
            refetchEvents()
        }
    })

    const deleteEventMutation = useMutation({
        ...trpc.events.delete.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.events.myEvents.queryKey() })
            refetchEvents()
        }
    })

    const handleEventCreated = () => {
        refetchEvents()
    }

    const handleStartEvent = async (eventId: number) => {
        try {
            await startEventMutation.mutateAsync({ id: eventId })
        } catch (error) {
            console.error("Error starting event:", error)
        }
    }

    const handleEndEvent = async (eventId: number) => {
        try {
            await endEventMutation.mutateAsync({ id: eventId })
        } catch (error) {
            console.error("Error ending event:", error)
        }
    }

    const handleDeleteEvent = async (eventId: number) => {
        try {
            await deleteEventMutation.mutateAsync({ id: eventId })
        } catch (error) {
            console.error("Error deleting event:", error)
        }
    }

    const tabCounts = {
        all: events.length,
        upcoming: events.filter(e => e.status === "UPCOMING").length,
        ongoing: events.filter(e => e.status === "ONGOING").length,
        completed: events.filter(e => e.status === "COMPLETED").length
    }

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Event Dashboard
                    </h1>
                    <p className="text-white/70 mt-1">
                        Manage your environmental cleanup events
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <DashboardStats
                totalEvents={stats.totalEvents}
                upcomingEvents={stats.upcomingEvents}
                totalParticipants={stats.totalParticipants}
                completedEvents={stats.completedEvents}
                isLoading={eventsLoading}
            />

            {/* Events Section */}
            <div>
                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-xl">Your Events</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-[#020E0E]/50 border border-[#01DE82]/20">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white"
                                >
                                    All ({tabCounts.all})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="upcoming"
                                    className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-white"
                                >
                                    Upcoming ({tabCounts.upcoming})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="ongoing"
                                    className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white"
                                >
                                    Ongoing ({tabCounts.ongoing})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="completed"
                                    className="data-[state=active]:bg-gray-500/20 data-[state=active]:text-gray-400 text-white"
                                >
                                    Completed ({tabCounts.completed})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="mt-6">
                                <EventGrid
                                    events={filteredEvents as any}
                                    onStart={handleStartEvent}
                                    onEnd={handleEndEvent}
                                    onDelete={handleDeleteEvent}
                                    isLoading={eventsLoading}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Floating Action Button */}
            <CreateEventSheet onEventCreated={handleEventCreated}>
                <div className="fixed bottom-8 right-8 z-40">
                    <Button
                        size="lg"
                        className="h-16 w-16 rounded-full bg-gradient-to-r from-[#01DE82] to-[#00B86B] hover:from-[#00B86B] hover:to-[#01DE82] text-black shadow-2xl shadow-[#01DE82]/30 border-2 border-[#01DE82]/40 hover:shadow-3xl hover:shadow-[#01DE82]/40 hover:scale-110 transition-all duration-300"
                    >
                        <Plus className="h-8 w-8" />
                    </Button>
                </div>
            </CreateEventSheet>
        </div>
    )
}
