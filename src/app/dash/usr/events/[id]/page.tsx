"use client"

import { useParams } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, MapPin, Users, Target, Clock, CheckCircle2, Trash2, Star, Award, KeyRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import * as motion from "motion/react-client"
import WasteSubmissionForm from "./waste-submission-form"

function BackgroundOrbs() {
    return (
        <>
            {/* Primary animated orb - Simplified */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-[#01DE82]/20 to-[#05614B]/15 rounded-full blur-3xl"
                animate={{
                    x: [0, 50, -25, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Secondary animated orb - Simplified */}
            <motion.div
                className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-[#05614B]/20 to-[#01DE82]/10 rounded-full blur-3xl"
                animate={{
                    x: [0, -60, 30, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* Tertiary animated orb - Simplified */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-gradient-to-tr from-[#01DE82]/15 to-[#05614B]/8 rounded-full blur-2xl"
                animate={{
                    x: [0, 40, -40, 0],
                    scale: [1, 1.3, 0.8, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4,
                }}
            />
        </>
    )
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const distance = targetDate.getTime() - now

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    return (
        <motion.div
            className="flex items-center justify-center space-x-4 p-8 bg-[#01DE82]/5 backdrop-blur-xl rounded-3xl border border-[#01DE82]/20 relative overflow-hidden group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/8 to-transparent"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Floating particles */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#01DE82]/60 rounded-full"
                    style={{
                        left: `${20 + i * 30}%`,
                        top: `${20 + i * 15}%`,
                    }}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                    }}
                />
            ))}

            <motion.div
                className="text-center relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <motion.div
                    className="text-3xl font-bold text-[#01DE82] drop-shadow-lg"
                    animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {timeLeft.days}
                </motion.div>
                <div className="text-sm text-white/80 font-medium">Days</div>
            </motion.div>
            <div className="text-3xl text-[#01DE82] font-bold relative z-10">:</div>
            <motion.div
                className="text-center relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <motion.div
                    className="text-3xl font-bold text-[#01DE82] drop-shadow-lg"
                    animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                >
                    {timeLeft.hours}
                </motion.div>
                <div className="text-sm text-white/80 font-medium">Hours</div>
            </motion.div>
            <div className="text-3xl text-[#01DE82] font-bold relative z-10">:</div>
            <motion.div
                className="text-center relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <motion.div
                    className="text-3xl font-bold text-[#01DE82] drop-shadow-lg"
                    animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                >
                    {timeLeft.minutes}
                </motion.div>
                <div className="text-sm text-white/80 font-medium">Minutes</div>
            </motion.div>
            <div className="text-3xl text-[#01DE82] font-bold relative z-10">:</div>
            <motion.div
                className="text-center relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <motion.div
                    className="text-3xl font-bold text-[#01DE82] drop-shadow-lg"
                    animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                >
                    {timeLeft.seconds}
                </motion.div>
                <div className="text-sm text-white/80 font-medium">Seconds</div>
            </motion.div>
        </motion.div>
    )
}

export default function EventDetailsPage() {
    const params = useParams()
    const eventId = parseInt(params.id as string)
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const { data: event, isLoading, refetch } = useQuery(trpc.events.getById.queryOptions({ id: eventId }))
    const [joinCode, setJoinCode] = useState("")

    const joinByCodeMutation = useMutation({
        ...trpc.events.joinByCode.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully joined the event using code!")
            setJoinCode("")
            queryClient.invalidateQueries({ queryKey: trpc.events.getById.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Invalid join code")
        }
    })

    const checkInMutation = useMutation({
        ...trpc.events.checkIn.mutationOptions(),
        onSuccess: () => {
            toast.success("Successfully checked in! You've earned XP!")
            queryClient.invalidateQueries({ queryKey: trpc.events.getById.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to check in")
        }
    })

    const verifyParticipationMutation = useMutation({
        ...trpc.events.verifyParticipation.mutationOptions(),
        onSuccess: () => {
            toast.success("Participation verified and bonus XP awarded!")
            queryClient.invalidateQueries({ queryKey: trpc.events.getById.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to verify participation")
        }
    })

    const [isWasteSheetOpen, setIsWasteSheetOpen] = useState(false)

    const handleJoinByCode = async () => {
        if (!joinCode.trim()) {
            toast.error("Please enter a join code")
            return
        }
        joinByCodeMutation.mutate({ joinCode: joinCode.trim() })
    }

    const handleCheckIn = async () => {
        checkInMutation.mutate({ eventId })
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-4">
                    <div className="h-8 bg-muted animate-pulse rounded-md w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded-md w-1/2" />
                    <div className="h-32 bg-muted animate-pulse rounded-md" />
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">Event not found</h3>
                            <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isUpcoming = event.status === "UPCOMING"
    const isOngoing = event.status === "ONGOING"
    const canSubmitWaste = event.currentUser.hasJoined && isOngoing && !event.currentUser.hasParticipated

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020E0E]">
            {/* Optimized animated gradient background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-[#05614B]/20 to-[#020E0E]" />
                <BackgroundOrbs />

                {/* Reduced floating particles for performance */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#01DE82]/50 rounded-full"
                        style={{
                            left: `${15 + i * 20}%`,
                            top: `${25 + i * 15}%`,
                        }}
                        animate={{
                            y: [0, -50, 0],
                            opacity: [0, 0.8, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 container mx-auto p-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center space-x-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Badge
                                variant={isUpcoming ? "secondary" : isOngoing ? "default" : "outline"}
                                className={`${isUpcoming ? 'bg-[#01DE82]/10 text-[#01DE82] border-[#01DE82]/30 backdrop-blur-sm' :
                                    isOngoing ? 'bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] font-bold shadow-lg shadow-[#01DE82]/20' :
                                        'border-[#01DE82]/20 text-white/60 backdrop-blur-sm'}`}
                            >
                                {event.status}
                            </Badge>
                        </motion.div>
                    </div>

                    <motion.h1
                        className="text-4xl font-bold bg-gradient-to-r from-[#01DE82] via-white to-[#01DE82] bg-clip-text text-transparent bg-[length:200%_100%]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{
                            duration: 0.8,
                            delay: 0.3,
                            backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                        }}
                    >
                        {event.title}
                    </motion.h1>
                    <motion.p
                        className="text-lg text-white/80 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {event.description}
                    </motion.p>
                </motion.div>

                {/* Countdown Timer for Upcoming Events */}
                {isUpcoming && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        whileHover={{ scale: 1.01, y: -5 }}
                    >
                        <Card className="bg-[#01DE82]/5 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/8 to-transparent"
                                animate={{ opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                            <CardHeader className="relative z-10">
                                <CardTitle className="flex items-center space-x-2 text-[#01DE82]">
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Clock className="h-5 w-5" />
                                    </motion.div>
                                    <span>Event Starts In</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <CountdownTimer targetDate={new Date(event.date)} />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{
                                y: -10,
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                <motion.div
                                    className="absolute inset-0 bg-[#01DE82]/5"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <CardHeader className="relative z-10">
                                    <CardTitle className="text-[#01DE82]">Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 relative z-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <CalendarDays className="h-4 w-4 text-[#01DE82]/70" />
                                            <span className="text-sm text-gray-300">{format(new Date(event.date), "PPP")}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-[#01DE82]/70" />
                                            <span className="text-sm text-gray-300">{format(new Date(event.date), "p")}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-[#01DE82]/70" />
                                            <span className="text-sm text-gray-300">{event.locationName}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Target className="h-4 w-4 text-[#01DE82]/70" />
                                            <span className="text-sm text-gray-300">{event.wasteTargetKg}kg target</span>
                                        </div>
                                    </div>

                                    <Separator className="bg-[#01DE82]/20" />

                                    <div>
                                        <h4 className="font-medium mb-2 text-[#01DE82]">Full Description</h4>
                                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                                    </div>

                                    {event.ngo && (
                                        <>
                                            <Separator className="bg-[#01DE82]/20" />
                                            <div>
                                                <h4 className="font-medium mb-2 text-[#01DE82]">Organized by</h4>
                                                <p className="text-sm text-gray-300">{event.ngo.name}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{
                                y: -10,
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Card className="bg-gradient-to-br from-[#05614B]/20 to-[#01DE82]/10 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                <motion.div
                                    className="absolute inset-0 bg-[#01DE82]/5"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <CardHeader className="relative z-10">
                                    <CardTitle className="flex items-center space-x-2 text-[#01DE82]">
                                        <motion.div
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                        >
                                            <Target className="h-5 w-5" />
                                        </motion.div>
                                        <span>Progress</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-white/80">Waste Collected</span>
                                            <motion.span
                                                className="text-[#01DE82] font-medium"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                {event.statistics.totalWasteCollected}kg / {event.wasteTargetKg}kg
                                            </motion.span>
                                        </div>
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            style={{ transformOrigin: "left" }}
                                        >
                                            <Progress
                                                value={event.statistics.progressPercentage}
                                                className="h-3 bg-[#020E0E]/50 border border-[#01DE82]/30 backdrop-blur-sm"
                                            />
                                        </motion.div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <motion.div
                                            className="p-4 bg-gradient-to-br from-[#01DE82]/15 to-[#05614B]/5 rounded-lg border border-[#01DE82]/30 backdrop-blur-sm relative overflow-hidden group"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-[#01DE82]/5"
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileHover={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                            <motion.div
                                                className="text-2xl font-bold text-[#01DE82] relative z-10"
                                                animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                {event.statistics.totalRegistrations}
                                            </motion.div>
                                            <div className="text-xs text-white/60 relative z-10">Registered</div>
                                        </motion.div>
                                        <motion.div
                                            className="p-4 bg-gradient-to-br from-[#05614B]/15 to-[#01DE82]/5 rounded-lg border border-[#01DE82]/30 backdrop-blur-sm relative overflow-hidden group"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.0 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-[#01DE82]/5"
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileHover={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                            <motion.div
                                                className="text-2xl font-bold text-[#01DE82] relative z-10"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                            >
                                                {event.statistics.totalParticipants}
                                            </motion.div>
                                            <div className="text-xs text-white/60 relative z-10">Participated</div>
                                        </motion.div>
                                        <motion.div
                                            className="p-4 bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/8 rounded-lg border border-[#01DE82]/30 backdrop-blur-sm relative overflow-hidden group"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.2 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-[#01DE82]/5"
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileHover={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                            <motion.div
                                                className="text-2xl font-bold text-[#01DE82] relative z-10"
                                                animate={{ rotate: [0, 5, -5, 0] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                {event.statistics.averageRating.toFixed(1)}
                                            </motion.div>
                                            <div className="text-xs text-white/60 relative z-10">Rating</div>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Participants */}
                        {event.participations.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.02,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                <Card className="bg-gradient-to-br from-[#01DE82]/15 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-[#01DE82]/5"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    {/* Floating particles */}
                                    <motion.div
                                        className="absolute top-4 right-4 w-2 h-2 bg-[#01DE82]/60 rounded-full"
                                        animate={{
                                            scale: [0, 1, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: 0.3,
                                        }}
                                    />
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="flex items-center space-x-2 text-[#01DE82]">
                                            <motion.div
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Award className="h-5 w-5" />
                                            </motion.div>
                                            <span>Top Contributors</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {event.participations.slice(0, 5).map((participation, index) => (
                                                <div key={participation.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={participation.user.picture || undefined} />
                                                            <AvatarFallback>
                                                                {participation.user.firstName[0]}{participation.user.lastName[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-medium">
                                                            {participation.user.firstName} {participation.user.lastName}
                                                        </span>
                                                    </div>
                                                    <Badge variant="secondary">{participation.wasteCollectedKg}kg</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Badge Notifications */}
                        {event.currentUser.hasParticipated && (
                            <motion.div
                                className="p-4 bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 rounded-lg border border-[#01DE82]/30 backdrop-blur-sm relative overflow-hidden"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-[#01DE82]/5 to-transparent"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                                <div className="flex items-center space-x-3 relative z-10">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 360],
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 2, repeat: Infinity }
                                        }}
                                    >
                                        <Award className="h-6 w-6 text-[#01DE82]" />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Badges Earned!</p>
                                        <p className="text-xs text-white/60">Check your profile for new achievements</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            whileHover={{
                                y: -10,
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <Card className="bg-gradient-to-br from-[#01DE82]/10 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/5 to-transparent"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                                <CardHeader className="relative z-10">
                                    <CardTitle className="text-[#01DE82]">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 relative z-10">
                                    {!event.currentUser.isRegistered ? (
                                        <div className="space-y-3">
                                            <motion.div
                                                className="space-y-2"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <label className="text-sm font-medium text-[#01DE82] flex items-center space-x-2">
                                                    <KeyRound className="h-4 w-4" />
                                                    <span>Enter Join Code</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter 6-character code"
                                                    value={joinCode}
                                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                    maxLength={6}
                                                    className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20"
                                                    disabled={!isUpcoming}
                                                />
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -5 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={handleJoinByCode}
                                                    disabled={!isUpcoming || joinByCodeMutation.isPending || !joinCode.trim()}
                                                    className="w-full bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] hover:from-[#05614B] hover:to-[#01DE82] font-bold shadow-2xl shadow-[#01DE82]/20 relative overflow-hidden group"
                                                >
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/20"
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        whileHover={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                    <span className="relative z-10 flex items-center">
                                                        <KeyRound className="h-4 w-4 mr-2" />
                                                        {joinByCodeMutation.isPending ? "Joining..." : "Join with Code"}
                                                    </span>
                                                </Button>
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <motion.div
                                                className="flex items-center space-x-2 text-[#01DE82] bg-[#01DE82]/10 p-3 rounded-lg border border-[#01DE82]/30 backdrop-blur-sm"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </motion.div>
                                                <span className="text-sm font-medium">You're registered!</span>
                                            </motion.div>

                                            {isOngoing && !event.currentUser.hasJoined && (
                                                <div className="space-y-3">
                                                    <motion.div
                                                        className="space-y-2"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        <label className="text-sm font-medium text-[#01DE82] flex items-center space-x-2">
                                                            <KeyRound className="h-4 w-4" />
                                                            <span>Enter Join Code to Check In</span>
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter 6-character code"
                                                            value={joinCode}
                                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                                            maxLength={6}
                                                            className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20"
                                                        />
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{ scale: 1.05, y: -5 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Button
                                                            onClick={handleJoinByCode}
                                                            disabled={joinByCodeMutation.isPending || !joinCode.trim()}
                                                            className="w-full bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] hover:from-[#05614B] hover:to-[#01DE82] font-bold shadow-2xl shadow-[#01DE82]/20 relative overflow-hidden"
                                                        >
                                                            <motion.div
                                                                className="absolute inset-0 bg-white/20"
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                whileHover={{ scale: 1, opacity: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                            <span className="relative z-10 flex items-center">
                                                                <KeyRound className="h-4 w-4 mr-2" />
                                                                {joinByCodeMutation.isPending ? "Checking in..." : "Check In with Code"}
                                                            </span>
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            )}

                                            {canSubmitWaste && (
                                                <Sheet open={isWasteSheetOpen} onOpenChange={setIsWasteSheetOpen}>
                                                    <SheetTrigger asChild>
                                                        <motion.div
                                                            whileHover={{ scale: 1.05, y: -5 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Button className="w-full bg-gradient-to-r from-[#01DE82] to-[#05614B] text-[#020E0E] hover:from-[#05614B] hover:to-[#01DE82] font-bold shadow-2xl shadow-[#01DE82]/20 relative overflow-hidden">
                                                                <motion.div
                                                                    className="absolute inset-0 bg-white/20"
                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                    whileHover={{ scale: 1, opacity: 1 }}
                                                                    transition={{ duration: 0.3 }}
                                                                />
                                                                <span className="relative z-10 flex items-center">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Submit Waste Collection
                                                                </span>
                                                            </Button>
                                                        </motion.div>
                                                    </SheetTrigger>
                                                    <SheetContent className="w-full sm:max-w-lg bg-gradient-to-br from-[#020E0E] via-[#05614B]/20 to-[#020E0E] border-[#01DE82]/30 backdrop-blur-xl">
                                                        <SheetHeader>
                                                            <SheetTitle className="text-xl bg-gradient-to-r from-[#01DE82] to-white bg-clip-text text-transparent">Submit Waste Collection</SheetTitle>
                                                            <SheetDescription className="text-white/80">
                                                                Record the waste you've collected during this cleanup event and earn XP!
                                                            </SheetDescription>
                                                        </SheetHeader>
                                                        <WasteSubmissionForm
                                                            eventId={eventId}
                                                            onSuccess={() => {
                                                                setIsWasteSheetOpen(false)
                                                                queryClient.invalidateQueries({ queryKey: trpc.events.getById.queryKey() })
                                                            }}
                                                        />
                                                    </SheetContent>
                                                </Sheet>
                                            )}

                                            {event.currentUser.hasParticipated && (
                                                <motion.div
                                                    className="flex items-center space-x-2 text-[#01DE82] bg-[#01DE82]/10 p-3 rounded-lg border border-[#01DE82]/30 backdrop-blur-sm"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <motion.div
                                                        animate={{ rotate: [0, 360] }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Award className="h-4 w-4" />
                                                    </motion.div>
                                                    <span className="text-sm font-medium">You've participated!</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Organizer Verification Section */}
                        {event.currentUser.isOrganizer && event.status === "COMPLETED" && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.02,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                                transition={{ duration: 0.6, delay: 1.4 }}
                            >
                                <Card className="bg-gradient-to-br from-[#01DE82]/15 to-[#05614B]/10 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/8 to-transparent"
                                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="flex items-center space-x-2 text-[#01DE82]">
                                            <motion.div
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Award className="h-5 w-5" />
                                            </motion.div>
                                            <span>Verify Participants</span>
                                        </CardTitle>
                                        <CardDescription className="text-white/60">
                                            Review and verify participant submissions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        {event.participations.filter(p => !p.isVerified).length > 0 ? (
                                            <div className="space-y-3">
                                                {event.participations.filter(p => !p.isVerified).slice(0, 3).map((participation) => (
                                                    <div key={participation.id} className="p-3 bg-[#020E0E]/30 rounded-lg border border-[#01DE82]/20 backdrop-blur-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={participation.user.picture || undefined} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {participation.user.firstName[0]}{participation.user.lastName[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm font-medium text-white">
                                                                    {participation.user.firstName} {participation.user.lastName}
                                                                </span>
                                                            </div>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {participation.wasteCollectedKg}kg
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Bonus XP (0-100)"
                                                                min="0"
                                                                max="100"
                                                                className="h-8 text-xs bg-[#020E0E]/50 border-[#01DE82]/30"
                                                                id={`bonus-${participation.id}`}
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    const bonusInput = document.getElementById(`bonus-${participation.id}`) as HTMLInputElement
                                                                    const bonusXp = parseInt(bonusInput?.value || "0")
                                                                    verifyParticipationMutation.mutate({
                                                                        participationId: participation.id,
                                                                        isVerified: true,
                                                                        bonusXP: Math.min(Math.max(bonusXp, 0), 100)
                                                                    })
                                                                }}
                                                                disabled={verifyParticipationMutation.isPending}
                                                                className="h-8 bg-[#01DE82] text-[#020E0E] hover:bg-[#05614B] text-xs"
                                                            >
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Verify
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {event.participations.filter(p => !p.isVerified).length > 3 && (
                                                    <p className="text-xs text-white/60 text-center">
                                                        +{event.participations.filter(p => !p.isVerified).length - 3} more pending
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <CheckCircle2 className="h-8 w-8 text-[#01DE82] mx-auto mb-2" />
                                                <p className="text-sm text-white/80">All participants verified!</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Join Code Display for Organizers */}
                        {event.currentUser.isOrganizer && event.status !== "COMPLETED" && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.02,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                                transition={{ duration: 0.6, delay: 1.0 }}
                            >
                                <Card className="bg-gradient-to-br from-[#05614B]/20 to-[#01DE82]/10 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-[#01DE82]/5"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="flex items-center space-x-2 text-[#01DE82]">
                                            <KeyRound className="h-5 w-5" />
                                            <span>Event Join Code</span>
                                        </CardTitle>
                                        <CardDescription className="text-white/60">
                                            Share this code with participants
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="text-center">
                                            <motion.div
                                                className="text-3xl font-bold text-[#01DE82] font-mono bg-[#020E0E]/50 p-4 rounded-lg border border-[#01DE82]/30 backdrop-blur-sm mb-3"
                                                animate={{ textShadow: ["0 0 10px #01DE82", "0 0 20px #01DE82", "0 0 10px #01DE82"] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                {event.joinCode}
                                            </motion.div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (event.joinCode) {
                                                        navigator.clipboard.writeText(event.joinCode)
                                                        toast.success("Join code copied to clipboard!")
                                                    }
                                                }}
                                                className="border-[#01DE82]/30 text-[#01DE82] hover:bg-[#01DE82]/10 text-xs"
                                            >
                                                Copy Code
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Event Creator */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            whileHover={{
                                y: -10,
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                        >
                            <Card className="bg-gradient-to-br from-[#05614B]/20 to-[#01DE82]/10 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                <motion.div
                                    className="absolute inset-0 bg-[#01DE82]/5"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <CardHeader className="relative z-10">
                                    <CardTitle className="text-[#01DE82]">Event Creator</CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <motion.div
                                        className="flex items-center space-x-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Avatar className="border-2 border-[#01DE82]/30">
                                                <AvatarFallback className="bg-[#01DE82]/10 text-[#01DE82] font-bold">
                                                    {event.creator.firstName[0]}{event.creator.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </motion.div>
                                        <div>
                                            <p className="font-medium text-white">{event.creator.firstName} {event.creator.lastName}</p>
                                            <p className="text-sm text-white/60">{event.creator.email}</p>
                                        </div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent Registrations */}
                        {event.registrations.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.02,
                                    transition: { type: "spring", stiffness: 300 }
                                }}
                                transition={{ duration: 0.6, delay: 1.2 }}
                            >
                                <Card className="bg-gradient-to-br from-[#01DE82]/15 to-[#05614B]/5 backdrop-blur-xl border-[#01DE82]/20 relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-[#01DE82]/8 to-transparent"
                                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                    {/* Floating particles */}
                                    {[...Array(2)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-[#01DE82]/60 rounded-full"
                                            style={{
                                                left: `${30 + i * 40}%`,
                                                top: `${25 + i * 20}%`,
                                            }}
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: i * 0.5,
                                            }}
                                        />
                                    ))}
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="flex items-center space-x-2 text-[#01DE82]">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Users className="h-5 w-5" />
                                            </motion.div>
                                            <span>Recent Registrations</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="space-y-3">
                                            {event.registrations.slice(0, 5).map((registration, index) => (
                                                <motion.div
                                                    key={registration.id}
                                                    className="flex items-center space-x-3 p-3 bg-[#01DE82]/5 rounded-lg border border-[#01DE82]/20 backdrop-blur-sm hover:bg-[#01DE82]/10 transition-all duration-300"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.2 + index * 0.1 }}
                                                    whileHover={{ scale: 1.02, x: 5 }}
                                                >
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        <Avatar className="h-8 w-8 border border-[#01DE82]/30">
                                                            <AvatarImage src={registration.user.picture || undefined} />
                                                            <AvatarFallback className="bg-[#01DE82]/10 text-[#01DE82] text-xs font-bold">
                                                                {registration.user.firstName[0]}{registration.user.lastName[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">
                                                            {registration.user.firstName} {registration.user.lastName}
                                                        </p>
                                                        <p className="text-xs text-white/60">
                                                            {format(new Date(registration.createdAt), "MMM d")}
                                                        </p>
                                                    </div>
                                                    {registration.hasJoined && (
                                                        <motion.div
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 text-[#01DE82]" />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
