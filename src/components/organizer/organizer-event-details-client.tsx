"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import QRCode from "react-qr-code"
import {
    Calendar,
    MapPin,
    Users,
    Target,
    Clock,
    Award,
    CheckCircle2,
    Play,
    Square,
    BarChart3,
    UserCheck,
    Copy,
    ArrowLeft,
    QrCode,
    Download,
    MessageSquare,
    Star
} from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { ParticipationReview } from "./participation-review"


interface OrganizerEventDetailsClientProps {
    eventId: number
}

export function OrganizerEventDetailsClient({ eventId }: OrganizerEventDetailsClientProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const router = useRouter()

    // Get event details
    const { data: event, isLoading } = useQuery(
        trpc.events.getById.queryOptions({ id: eventId })
    )

    // Mutations for event management
    const startEventMutation = useMutation({
        ...trpc.events.startEvent.mutationOptions(),
        onSuccess: () => {
            toast.success("Event started successfully!")
            queryClient.invalidateQueries({ queryKey: trpc.events.getById.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to start event")
        }
    })

    const endEventMutation = useMutation({
        ...trpc.events.endEvent.mutationOptions(),
        onSuccess: () => {
            toast.success("Event ended successfully!")
            queryClient.invalidateQueries({ queryKey: trpc.events.getById.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to end event")
        }
    })

    const handleStartEvent = () => {
        startEventMutation.mutate({ id: eventId })
    }

    const handleEndEvent = () => {
        endEventMutation.mutate({ id: eventId })
    }

    const copyJoinCode = () => {
        if (event?.joinCode) {
            navigator.clipboard.writeText(event.joinCode)
            toast.success("Join code copied to clipboard!")
        }
    }

    const downloadQRCode = () => {
        if (!event?.joinCode) return

        const qrCodeUrl = `${window.location.origin}/dash/usr/events/${eventId}?joinCode=${event.joinCode}`
        const svg = document.getElementById("qr-code-svg")
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg)
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const img = new Image()

            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                if (ctx) {
                    ctx.fillStyle = "white"
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(img, 0, 0)

                    const link = document.createElement("a")
                    link.download = `event-${event.title}-qr-code.png`
                    link.href = canvas.toDataURL()
                    link.click()
                }
            }

            img.src = "data:image/svg+xml;base64," + btoa(svgData)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020E0E] p-6 space-y-6">
                <div className="space-y-4">
                    <div className="h-8 bg-[#01DE82]/20 animate-pulse rounded-md w-3/4" />
                    <div className="h-4 bg-[#01DE82]/20 animate-pulse rounded-md w-1/2" />
                    <div className="h-32 bg-[#01DE82]/20 animate-pulse rounded-md" />
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#020E0E] p-6">
                <div className="bg-white/5 border border-[#01DE82]/20 rounded-lg p-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">Event not found</h3>
                        <p className="text-white/60 mb-4">The event you're looking for doesn't exist or you don't have permission to view it.</p>
                        <Button
                            onClick={() => router.push("/dash/org")}
                            className="bg-[#01DE82] hover:bg-[#01DE82]/80 text-[#020E0E]"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const isUpcoming = event.status === "UPCOMING"
    const isOngoing = event.status === "ONGOING"
    const isCompleted = event.status === "COMPLETED"

    const totalWasteCollected = event.participations.reduce((sum, p) => sum + p.wasteCollectedKg, 0)
    const progressPercentage = Math.min((totalWasteCollected / event.wasteTargetKg) * 100, 100)

    return (
        <div className="min-h-screen bg-[#020E0E] p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dash/org")}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                        <p className="text-white/70 mt-1">{event.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge
                            variant={isUpcoming ? "secondary" : isOngoing ? "default" : "outline"}
                            className={`${isUpcoming ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                isOngoing ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
                        >
                            {event.status}
                        </Badge>
                        {isUpcoming && (
                            <Button
                                onClick={handleStartEvent}
                                disabled={startEventMutation.isPending}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Start Event
                            </Button>
                        )}
                        {isOngoing && (
                            <Button
                                onClick={handleEndEvent}
                                disabled={endEventMutation.isPending}
                                variant="destructive"
                            >
                                <Square className="h-4 w-4 mr-2" />
                                End Event
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#01DE82]/10 border border-[#01DE82]/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">Registrations</p>
                            <p className="text-2xl font-bold text-[#01DE82]">{event.registrations.length}</p>
                        </div>
                        <Users className="h-8 w-8 text-[#01DE82]" />
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">Participants</p>
                            <p className="text-2xl font-bold text-blue-400">{event.participations.length}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">Waste Collected</p>
                            <p className="text-2xl font-bold text-green-400">{totalWasteCollected.toFixed(1)} kg</p>
                        </div>
                        <Target className="h-8 w-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-sm">Progress</p>
                            <p className="text-2xl font-bold text-purple-400">{progressPercentage.toFixed(1)}%</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-400" />
                    </div>
                </div>
            </div>            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-[#020E0E] border border-[#01DE82]/20">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Feedback ({event.feedbacks.length})
                    </TabsTrigger>
                    <TabsTrigger value="registrations" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Registrations ({event.registrations.length})
                    </TabsTrigger>
                    <TabsTrigger value="review" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                        Review Submissions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Event Details */}
                        <div className="bg-[#01DE82]/10 border border-[#01DE82]/20 rounded-lg">
                            <div className="p-6 border-b border-[#01DE82]/20">
                                <h3 className="text-lg font-semibold text-[#01DE82]">Event Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center space-x-3 text-white/80">
                                    <Calendar className="h-5 w-5 text-[#01DE82]" />
                                    <span>{format(new Date(event.date), "PPP")}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-white/80">
                                    <Clock className="h-5 w-5 text-[#01DE82]" />
                                    <span>{format(new Date(event.startTime), "p")}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-white/80">
                                    <MapPin className="h-5 w-5 text-[#01DE82]" />
                                    <span>{event.locationName}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-white/80">
                                    <Target className="h-5 w-5 text-[#01DE82]" />
                                    <span>Target: {event.wasteTargetKg} kg</span>
                                </div>
                            </div>
                        </div>

                        {/* Join Code */}
                        {(isUpcoming || isOngoing) && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="p-6 border-b border-blue-500/20">
                                    <h3 className="text-lg font-semibold text-blue-400">Join Code & QR Code</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-mono font-bold text-white bg-white/10 p-4 rounded-lg mb-4">
                                            {event.joinCode}
                                        </div>

                                        <div className="flex gap-2 justify-center mb-4">
                                            <Button
                                                onClick={copyJoinCode}
                                                variant="ghost"
                                                className="text-blue-400 hover:bg-blue-500/10"
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-blue-400 hover:bg-blue-500/10"
                                                    >
                                                        <QrCode className="h-4 w-4 mr-2" />
                                                        QR Code
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-[#020E0E] border-[#01DE82]/20 max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-[#01DE82]">Event Join QR Code</DialogTitle>
                                                        <DialogDescription className="text-white/60">
                                                            Scan this QR code to join the event directly. Only works for registered users.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex flex-col items-center space-y-4">
                                                        <div className="bg-white p-4 rounded-lg">
                                                            <QRCode
                                                                id="qr-code-svg"
                                                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/dash/usr/events/${eventId}?joinCode=${event.joinCode}`}
                                                                size={200}
                                                                level="M"
                                                            // includeMargin={true}
                                                            />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-white/80 text-sm mb-3">
                                                                This QR code will redirect registered users to the event page with the join code pre-filled.
                                                            </p>
                                                            <Button
                                                                onClick={downloadQRCode}
                                                                className="bg-[#01DE82] hover:bg-[#01DE82]/80 text-[#020E0E]"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download QR Code
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                    <p className="text-white/60 text-sm text-center">
                                        Share this code or QR code with participants to join the event. QR code automatically fills the join code for registered users.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Progress */}
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg lg:col-span-2">
                            <div className="p-6 border-b border-green-500/20">
                                <h3 className="text-lg font-semibold text-green-400">Waste Collection Progress</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-white/80 mb-2">
                                        <span>Collected: {totalWasteCollected.toFixed(1)} kg</span>
                                        <span>Target: {event.wasteTargetKg} kg</span>
                                    </div>
                                    <Progress
                                        value={progressPercentage}
                                        className="h-3 bg-white/10"
                                    />
                                </div>
                                <p className="text-white/60 text-sm">
                                    {progressPercentage >= 100 ? "🎉 Target achieved!" : `${(100 - progressPercentage).toFixed(1)}% remaining`}
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-6">
                    <div className="bg-[#01DE82]/10 border border-[#01DE82]/20 rounded-lg">
                        <div className="p-6 border-b border-[#01DE82]/20">
                            <h3 className="text-lg font-semibold text-[#01DE82] flex items-center space-x-2">
                                <MessageSquare className="h-5 w-5" />
                                <span>Event Feedback</span>
                            </h3>
                        </div>
                        <div className="p-6">
                            {event.feedbacks.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-12 w-12 text-white/40 mx-auto mb-4" />
                                    <p className="text-white/60">No feedback received yet</p>
                                    <p className="text-white/40 text-sm mt-2">Feedback will appear here after participants submit their reviews</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {event.feedbacks.map((feedback) => (
                                        <div
                                            key={feedback.id}
                                            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-10 w-10 border-2 border-[#01DE82]/30">
                                                        <AvatarImage src={feedback.user.picture || undefined} />
                                                        <AvatarFallback className="bg-[#01DE82]/20 text-[#01DE82] font-bold">
                                                            {feedback.user.firstName[0]}{feedback.user.lastName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {feedback.user.firstName} {feedback.user.lastName}
                                                        </p>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex items-center space-x-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`h-4 w-4 ${star <= feedback.rating
                                                                                ? 'text-[#01DE82] fill-current'
                                                                                : 'text-white/30'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-white/60">
                                                                {feedback.rating}/5 stars
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-[#01DE82]/30 text-[#01DE82] mb-1"
                                                    >
                                                        {feedback.category}
                                                    </Badge>
                                                    <p className="text-sm text-white/60">
                                                        {format(new Date(feedback.createdAt), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            {feedback.comment && (
                                                <div className="mt-3 p-3 bg-[#020E0E]/50 rounded-lg border border-[#01DE82]/20">
                                                    <p className="text-white/80 text-sm leading-relaxed">
                                                        "{feedback.comment}"
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                                                <div className="flex items-center space-x-2">
                                                    <Badge
                                                        variant={feedback.isPublic ? "default" : "secondary"}
                                                        className={feedback.isPublic
                                                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"}
                                                    >
                                                        {feedback.isPublic ? "Public" : "Private"}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-white/40">
                                                    Submitted {format(new Date(feedback.createdAt), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feedback Summary Stats */}
                    {event.feedbacks.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">
                                        {(event.feedbacks.reduce((sum, f) => sum + f.rating, 0) / event.feedbacks.length).toFixed(1)}
                                    </p>
                                    <p className="text-white/70 text-sm">Average Rating</p>
                                </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">
                                        {event.feedbacks.filter(f => f.isPublic).length}
                                    </p>
                                    <p className="text-white/70 text-sm">Public Reviews</p>
                                </div>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-400">
                                        {Math.round((event.feedbacks.length / event.participations.length) * 100)}%
                                    </p>
                                    <p className="text-white/70 text-sm">Response Rate</p>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="registrations" className="space-y-6">
                    <div className="bg-[#01DE82]/10 border border-[#01DE82]/20 rounded-lg">
                        <div className="p-6 border-b border-[#01DE82]/20">
                            <h3 className="text-lg font-semibold text-[#01DE82]">Event Registrations</h3>
                        </div>
                        <div className="p-6">
                            {event.registrations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                                    <p className="text-white/60">No registrations yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {event.registrations.map((registration) => (
                                        <div
                                            key={registration.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="h-10 w-10 border-2 border-[#01DE82]/30">
                                                    <AvatarImage src={registration.user.picture || undefined} />
                                                    <AvatarFallback className="bg-[#01DE82]/20 text-[#01DE82] font-bold">
                                                        {registration.user.firstName[0]}{registration.user.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {registration.user.firstName} {registration.user.lastName}
                                                    </p>
                                                    <p className="text-sm text-white/60">{registration.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {registration.hasJoined ? (
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Checked In
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                                        Registered
                                                    </Badge>
                                                )}
                                                <span className="text-sm text-white/60">
                                                    {format(new Date(registration.createdAt), "MMM d")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="review" className="space-y-6">
                    <ParticipationReview eventId={eventId} eventTitle={event.title} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
