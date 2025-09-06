"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import {
    BarChart3,
    Calendar,
    Users,
    Recycle,
    Star,
    Trophy,
    Leaf,
    TreePine,
    Zap,
    Droplets,
    Target,
} from "lucide-react"
import { format } from "date-fns"

export function AnalyticsClient() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [sortBy, setSortBy] = useState<'participants' | 'waste' | 'rating'>('participants')

    const trpc = useTRPC()

    // Fetch analytics data
    const { data: overview, isLoading: overviewLoading } = useQuery(
        trpc.analytics.getOrganizerOverview.queryOptions()
    )

    const { data: monthlyData, isLoading: monthlyLoading } = useQuery(
        trpc.analytics.getMonthlyAnalytics.queryOptions({ year: selectedYear })
    )

    const { data: statusDistribution, isLoading: statusLoading } = useQuery(
        trpc.analytics.getEventStatusDistribution.queryOptions()
    )

    const { data: topEvents, isLoading: topEventsLoading } = useQuery(
        trpc.analytics.getTopEvents.queryOptions({ limit: 5, sortBy })
    )

    const { data: impactStats, isLoading: impactLoading } = useQuery(
        trpc.analytics.getImpactStats.queryOptions()
    )

    if (overviewLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-[#01DE82]/20 animate-pulse rounded-md w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-[#01DE82]/20 animate-pulse rounded-lg" />
                    ))}
                </div>
                <div className="h-96 bg-[#01DE82]/20 animate-pulse rounded-lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 px-4 py-3">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                    <BarChart3 className="h-8 w-8 text-[#01DE82]" />
                    <span>Impact Analytics</span>
                </h1>
                <p className="text-white/70">Track your environmental impact and event performance</p>
            </div>

            {/* Overview Stats */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-[#01DE82]/10 border-[#01DE82]/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-sm">Total Events</p>
                                    <p className="text-3xl font-bold text-[#01DE82]">{overview.totalEvents}</p>
                                    <p className="text-white/60 text-xs mt-1">
                                        {overview.completedEvents} completed
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-[#01DE82]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-sm">Total Participants</p>
                                    <p className="text-3xl font-bold text-blue-400">{overview.totalParticipants}</p>
                                    <p className="text-white/60 text-xs mt-1">
                                        {overview.totalRegistrations} registrations
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-500/10 border-green-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-sm">Waste Collected</p>
                                    <p className="text-3xl font-bold text-green-400">
                                        {overview.totalWasteCollected.toFixed(1)}
                                    </p>
                                    <p className="text-white/60 text-xs mt-1">kg total</p>
                                </div>
                                <Recycle className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-yellow-500/10 border-yellow-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/70 text-sm">Average Rating</p>
                                    <p className="text-3xl font-bold text-yellow-400">
                                        {overview.averageRating.toFixed(1)}
                                    </p>
                                    <p className="text-white/60 text-xs mt-1">
                                        {overview.totalFeedbacks} reviews
                                    </p>
                                </div>
                                <Star className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Analytics */}
            <Tabs defaultValue="trends" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-[#020E0E] border border-[#01DE82]/20">
                    <TabsTrigger value="trends" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Trends
                    </TabsTrigger>
                    <TabsTrigger value="events" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Event Status
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Top Events
                    </TabsTrigger>
                    <TabsTrigger value="impact" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Environmental Impact
                    </TabsTrigger>
                </TabsList>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-6">
                    <Card className="bg-white/5 border-[#01DE82]/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">Monthly Trends</CardTitle>
                                    <CardDescription className="text-white/60">
                                        Track your organization's monthly performance
                                    </CardDescription>
                                </div>
                                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                                    <SelectTrigger className="w-32 bg-[#020E0E] border-[#01DE82]/30 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#020E0E] border-[#01DE82]/30">
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - i
                                            return (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {monthlyData && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#01DE82/20" />
                                        <XAxis
                                            dataKey="monthName"
                                            stroke="#ffffff60"
                                            tick={{ fill: '#ffffff60' }}
                                        />
                                        <YAxis
                                            stroke="#ffffff60"
                                            tick={{ fill: '#ffffff60' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#020E0E',
                                                border: '1px solid #01DE82',
                                                borderRadius: '8px',
                                                color: '#ffffff'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="eventsCount" fill="#01DE82" name="Events" />
                                        <Bar dataKey="participantsCount" fill="#3B82F6" name="Participants" />
                                        <Bar dataKey="wasteCollected" fill="#10B981" name="Waste (kg)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Event Status Tab */}
                <TabsContent value="events" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/5 border-[#01DE82]/20">
                            <CardHeader>
                                <CardTitle className="text-white">Event Status Distribution</CardTitle>
                                <CardDescription className="text-white/60">
                                    Overview of your events by status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {statusDistribution && (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#020E0E',
                                                    border: '1px solid #01DE82',
                                                    borderRadius: '8px',
                                                    color: '#ffffff'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-[#01DE82]/20">
                            <CardHeader>
                                <CardTitle className="text-white">Quick Stats</CardTitle>
                                <CardDescription className="text-white/60">
                                    Current status overview
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {overview && (
                                    <>
                                        <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                            <span className="text-white/80">Upcoming Events</span>
                                            <Badge className="bg-blue-500/30 text-blue-400 border-blue-500/50">
                                                {overview.upcomingEvents}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                                            <span className="text-white/80">Ongoing Events</span>
                                            <Badge className="bg-green-500/30 text-green-400 border-green-500/50">
                                                {overview.ongoingEvents}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                            <span className="text-white/80">Completed Events</span>
                                            <Badge className="bg-purple-500/30 text-purple-400 border-purple-500/50">
                                                {overview.completedEvents}
                                            </Badge>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <Card className="bg-white/5 border-[#01DE82]/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Trophy className="h-5 w-5 text-[#01DE82]" />
                                        <span>Top Performing Events</span>
                                    </CardTitle>
                                    <CardDescription className="text-white/60">
                                        Your best events ranked by performance
                                    </CardDescription>
                                </div>
                                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                    <SelectTrigger className="w-40 bg-[#020E0E] border-[#01DE82]/30 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#020E0E] border-[#01DE82]/30">
                                        <SelectItem value="participants">Participants</SelectItem>
                                        <SelectItem value="waste">Waste Collected</SelectItem>
                                        <SelectItem value="rating">Rating</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {topEvents && (
                                <div className="space-y-4">
                                    {topEvents.map((event, index) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#01DE82]/20 border border-[#01DE82]/30">
                                                    <span className="text-[#01DE82] font-bold text-sm">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium">{event.title}</h3>
                                                    <p className="text-white/60 text-sm">
                                                        {format(new Date(event.date), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-6 text-sm">
                                                <div className="text-center">
                                                    <p className="text-white/60">Participants</p>
                                                    <p className="text-blue-400 font-bold">{event.participantCount}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white/60">Waste (kg)</p>
                                                    <p className="text-green-400 font-bold">{event.wasteCollected.toFixed(1)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white/60">Rating</p>
                                                    <p className="text-yellow-400 font-bold">
                                                        {event.averageRating > 0 ? event.averageRating.toFixed(1) : 'N/A'}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={event.status === 'COMPLETED' ? 'default' : 'secondary'}
                                                    className={
                                                        event.status === 'COMPLETED'
                                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                    }
                                                >
                                                    {event.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Environmental Impact Tab */}
                <TabsContent value="impact" className="space-y-6">
                    {impactStats && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="bg-green-500/10 border-green-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/70 text-sm">CO₂ Saved</p>
                                                <p className="text-2xl font-bold text-green-400">
                                                    {impactStats.carbonSavedKg}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">kg</p>
                                            </div>
                                            <Leaf className="h-8 w-8 text-green-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-blue-500/10 border-blue-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/70 text-sm">Trees Equivalent</p>
                                                <p className="text-2xl font-bold text-blue-400">
                                                    {impactStats.treesEquivalent}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">trees/year</p>
                                            </div>
                                            <TreePine className="h-8 w-8 text-blue-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-yellow-500/10 border-yellow-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/70 text-sm">Energy Saved</p>
                                                <p className="text-2xl font-bold text-yellow-400">
                                                    {impactStats.energySavedKwh}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">kWh</p>
                                            </div>
                                            <Zap className="h-8 w-8 text-yellow-400" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-cyan-500/10 border-cyan-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/70 text-sm">Water Saved</p>
                                                <p className="text-2xl font-bold text-cyan-400">
                                                    {impactStats.waterSavedLiters}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">liters</p>
                                            </div>
                                            <Droplets className="h-8 w-8 text-cyan-400" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-white/5 border-[#01DE82]/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <Target className="h-5 w-5 text-[#01DE82]" />
                                        <span>Environmental Impact Summary</span>
                                    </CardTitle>
                                    <CardDescription className="text-white/60">
                                        Your organization's contribution to environmental protection
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-white font-medium">Direct Impact</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/70">Total Waste Collected</span>
                                                    <span className="text-[#01DE82] font-bold">{impactStats.totalWasteKg} kg</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/70">Total Events</span>
                                                    <span className="text-blue-400 font-bold">{impactStats.totalEvents}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/70">Total Participants</span>
                                                    <span className="text-green-400 font-bold">{impactStats.totalParticipants}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-white font-medium">Environmental Benefits</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/70">CO₂ Reduction</span>
                                                    <span className="text-green-400 font-bold">{impactStats.carbonSavedKg} kg</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/70">Energy Conservation</span>
                                                    <span className="text-yellow-400 font-bold">{impactStats.energySavedKwh} kWh</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white/70">Water Conservation</span>
                                                    <span className="text-cyan-400 font-bold">{impactStats.waterSavedLiters} L</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#01DE82]/10 rounded-lg border border-[#01DE82]/20">
                                        <p className="text-white/80 text-sm text-center">
                                            🌱 Your events have made a significant positive impact on the environment!
                                            This is equivalent to planting <strong className="text-[#01DE82]">{impactStats.treesEquivalent} trees</strong> that
                                            would absorb CO₂ for a full year.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
