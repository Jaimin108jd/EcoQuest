"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
    Calendar,
    MapPin,
    Users,
    Target,
    Clock,
    MoreVertical,
    Edit,
    Trash2,
    Play,
    Square,
    Eye,
    QrCode
} from "lucide-react"
import * as motion from "motion/react-client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Event {
    id: number
    title: string
    description: string
    date: Date
    startTime: Date
    endTime?: Date
    latitude: number
    longitude: number
    locationName: string
    wasteTargetKg: number
    status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED"
    joinCode: string
    ngo: {
        id: number
        name: string
    }
    _count: {
        registrations: number
    }
    creator?: {
        id: number
        firstName: string
        lastName: string
        email: string
    }
}

interface EventCardProps {
    event: Event
    onEdit?: (event: Event) => void
    onDelete?: (eventId: number) => void
    onStart?: (eventId: number) => void
    onEnd?: (eventId: number) => void
    onViewDetails?: (event: Event) => void
}

const statusConfig = {
    UPCOMING: {
        color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        label: "Upcoming"
    },
    ONGOING: {
        color: "bg-green-500/10 text-green-400 border-green-500/30",
        label: "Ongoing"
    },
    COMPLETED: {
        color: "bg-gray-500/10 text-gray-400 border-gray-500/30",
        label: "Completed"
    },
    CANCELLED: {
        color: "bg-red-500/10 text-red-400 border-red-500/30",
        label: "Cancelled"
    }
}

export function EventCard({
    event,
    onEdit,
    onDelete,
    onStart,
    onEnd,
    onViewDetails
}: EventCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const statusStyle = statusConfig[event.status]

    const handleDelete = async () => {
        if (onDelete) {
            setIsDeleting(true)
            try {
                await onDelete(event.id)
            } finally {
                setIsDeleting(false)
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-300">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-white text-lg font-semibold line-clamp-2">
                                {event.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={statusStyle.color}>
                                    {statusStyle.label}
                                </Badge>
                                <div className="flex items-center text-white/60 text-sm">
                                    <Users className="h-4 w-4 mr-1" />
                                    {event._count.registrations} registered
                                </div>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="bg-[#020E0E]/95 backdrop-blur-xl border-[#01DE82]/30 text-white"
                                align="end"
                            >
                                <DropdownMenuItem
                                    onClick={() => onViewDetails?.(event)}
                                    className="hover:bg-[#01DE82]/10"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>

                                {event.status === "UPCOMING" && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onEdit?.(event)}
                                            className="hover:bg-[#01DE82]/10"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Event
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onStart?.(event.id)}
                                            className="hover:bg-green-500/10 text-green-400"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Start Event
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {event.status === "ONGOING" && (
                                    <>
                                        <DropdownMenuItem className="hover:bg-[#01DE82]/10">
                                            <QrCode className="h-4 w-4 mr-2" />
                                            Show QR Code
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onEnd?.(event.id)}
                                            className="hover:bg-orange-500/10 text-orange-400"
                                        >
                                            <Square className="h-4 w-4 mr-2" />
                                            End Event
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {event.status !== "ONGOING" && (
                                    <>
                                        <DropdownMenuSeparator className="bg-[#01DE82]/20" />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem
                                                    onSelect={(e) => e.preventDefault()}
                                                    className="hover:bg-red-500/10 text-red-400 focus:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Event
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-[#020E0E]/95 backdrop-blur-xl border-[#01DE82]/30 text-white">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-white/70">
                                                        Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-transparent border-[#01DE82]/30 text-white hover:bg-[#01DE82]/10">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDelete}
                                                        disabled={isDeleting}
                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        {isDeleting ? "Deleting..." : "Delete"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-white/80 text-sm line-clamp-2">
                        {event.description}
                    </p>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center text-white/70">
                            <Calendar className="h-4 w-4 mr-2 text-[#01DE82]" />
                            {format(event.date, "PPP")}
                        </div>

                        <div className="flex items-center text-white/70">
                            <Clock className="h-4 w-4 mr-2 text-[#01DE82]" />
                            {format(event.startTime, "HH:mm")}
                            {event.endTime && ` - ${format(event.endTime, "HH:mm")}`}
                        </div>

                        <div className="flex items-center text-white/70">
                            <MapPin className="h-4 w-4 mr-2 text-[#01DE82]" />
                            <span className="truncate">{event.locationName}</span>
                        </div>

                        <div className="flex items-center text-white/70">
                            <Target className="h-4 w-4 mr-2 text-[#01DE82]" />
                            Target: {event.wasteTargetKg} kg
                        </div>
                    </div>

                    {event.status === "ONGOING" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div className="text-green-400 text-sm font-medium">
                                    Event is live!
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <QrCode className="h-4 w-4 mr-1" />
                                    QR Code
                                </Button>
                            </div>
                            <p className="text-green-400/80 text-xs mt-1">
                                Join Code: <span className="font-mono font-bold">{event.joinCode}</span>
                            </p>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

interface EventGridProps {
    events: Event[]
    onEdit?: (event: Event) => void
    onDelete?: (eventId: number) => void
    onStart?: (eventId: number) => void
    onEnd?: (eventId: number) => void
    onViewDetails?: (event: Event) => void
    isLoading?: boolean
}

export function EventGrid({
    events,
    onEdit,
    onDelete,
    onStart,
    onEnd,
    onViewDetails,
    isLoading
}: EventGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#020E0E]/60 backdrop-blur-xl border border-[#01DE82]/20 rounded-lg p-6 space-y-4"
                    >
                        <div className="h-4 bg-[#01DE82]/20 rounded animate-pulse" />
                        <div className="h-3 bg-[#01DE82]/10 rounded animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-3 bg-[#01DE82]/10 rounded animate-pulse" />
                            <div className="h-3 bg-[#01DE82]/10 rounded animate-pulse w-3/4" />
                        </div>
                    </motion.div>
                ))}
            </div>
        )
    }

    if (events.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
            >
                <Calendar className="h-16 w-16 text-[#01DE82]/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
                <p className="text-white/60 mb-6">
                    Create your first event to start organizing environmental cleanups
                </p>
            </motion.div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <EventCard
                        event={event}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onStart={onStart}
                        onEnd={onEnd}
                        onViewDetails={onViewDetails}
                    />
                </motion.div>
            ))}
        </div>
    )
}
