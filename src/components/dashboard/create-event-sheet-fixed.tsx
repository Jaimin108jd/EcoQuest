"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, MapPin, Target, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LocationPicker } from "@/components/utils/location-picker"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const createEventSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        locationName: z.string().min(1, "Location is required")
    }),
    date: z.date({
        message: "Event date is required",
    }).refine(date => date > new Date(), "Event date must be in the future"),
    startTime: z.string().min(1, "Start time is required"),
    wasteTargetKg: z.number().min(0.1, "Waste target must be greater than 0").max(10000, "Waste target too large")
})

type CreateEventFormData = z.infer<typeof createEventSchema>

interface CreateEventSheetProps {
    children: React.ReactNode
    onEventCreated?: () => void
}

export function CreateEventSheet({ children, onEventCreated }: CreateEventSheetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const form = useForm<CreateEventFormData>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            title: "",
            description: "",
            location: {
                latitude: 0,
                longitude: 0,
                locationName: ""
            },
            date: undefined,
            startTime: "",
            wasteTargetKg: 10
        }
    })

    const createEventMutation = useMutation({
        ...trpc.events.create.mutationOptions(),
        onSuccess: () => {
            // Invalidate events queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ['events'] })
            setIsOpen(false)
            form.reset({
                title: "",
                description: "",
                location: {
                    latitude: 0,
                    longitude: 0,
                    locationName: ""
                },
                date: undefined,
                startTime: "",
                wasteTargetKg: 10
            })
            onEventCreated?.()
        },
        onError: (error) => {
            console.error("Error creating event:", error)
        }
    })

    const onSubmit = async (data: CreateEventFormData) => {
        try {
            setIsSubmitting(true)

            // Combine date and time
            const [hours, minutes] = data.startTime.split(':').map(Number)
            const startDateTime = new Date(data.date)
            startDateTime.setHours(hours, minutes, 0, 0)

            const payload = {
                title: data.title,
                description: data.description,
                latitude: data.location.latitude,
                longitude: data.location.longitude,
                locationName: data.location.locationName,
                date: data.date,
                startTime: startDateTime,
                wasteTargetKg: data.wasteTargetKg
            }

            await createEventMutation.mutateAsync(payload)
        } catch (error) {
            console.error("Submit error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLocationSelect = (location: { latitude: number; longitude: number; locationName: string }) => {
        form.setValue('location', location)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-full sm:max-w-xl bg-[#020E0E]/95 backdrop-blur-xl border-[#01DE82]/20 text-white overflow-y-auto"
            >
                <SheetHeader className="space-y-3 pb-6">
                    <SheetTitle className="text-2xl font-bold text-[#01DE82] flex items-center gap-2">
                        <Target className="h-6 w-6" />
                        Create New Event
                    </SheetTitle>
                    <SheetDescription className="text-white/70 text-base">
                        Set up a new environmental cleanup event for your community
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Event Details Card */}
                            <Card className="bg-[#01DE82]/5 border-[#01DE82]/20">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-[#01DE82] mb-4">Event Details</h3>

                                    {/* Title */}
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white font-medium">Event Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Beach Cleanup Drive 2025"
                                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20 h-11"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Description */}
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white font-medium">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your event, what participants should expect, what to bring..."
                                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20 min-h-[100px] resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-white/60 text-sm">
                                                    Provide details about the event to help participants prepare
                                                </FormDescription>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Location & Timing Card */}
                            <Card className="bg-[#01DE82]/5 border-[#01DE82]/20">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-[#01DE82] mb-4">Location & Timing</h3>

                                    {/* Location */}
                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <LocationPicker
                                                    onLocationSelect={handleLocationSelect}
                                                    initialLocation={field.value}
                                                    label="Event Location"
                                                    placeholder="Where will the event take place?"
                                                />
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date */}
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white font-medium">Event Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full h-11 bg-[#020E0E]/50 border-[#01DE82]/30 text-white hover:bg-[#01DE82]/10 hover:border-[#01DE82] justify-start text-left font-normal",
                                                                        !field.value && "text-white/50"
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4 text-[#01DE82]" />
                                                                    {field.value ? format(field.value, "PPP") : "Select date"}
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto p-0 bg-[#020E0E]/95 backdrop-blur-xl border-[#01DE82]/30"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value || undefined}
                                                                onSelect={(date) => field.onChange(date || undefined)}
                                                                disabled={(date) => date < new Date()}
                                                                initialFocus
                                                                className="text-white [&_.rdp-day_selected]:bg-[#01DE82] [&_.rdp-day_selected]:text-black [&_.rdp-day]:text-white [&_.rdp-head_cell]:text-white/70"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Start Time */}
                                        <FormField
                                            control={form.control}
                                            name="startTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white font-medium">Start Time</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#01DE82]" />
                                                            <Input
                                                                type="time"
                                                                className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white focus:border-[#01DE82] focus:ring-[#01DE82]/20 pl-10 h-11"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Target & Goals Card */}
                            <Card className="bg-[#01DE82]/5 border-[#01DE82]/20">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-[#01DE82] mb-4">Target & Goals</h3>

                                    {/* Waste Target */}
                                    <FormField
                                        control={form.control}
                                        name="wasteTargetKg"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white font-medium">Waste Collection Target (kg)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#01DE82]" />
                                                        <Input
                                                            type="number"
                                                            min="0.1"
                                                            step="0.1"
                                                            placeholder="10"
                                                            className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-[#01DE82]/20 pl-10 h-11"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription className="text-white/60 text-sm">
                                                    Set a realistic target for waste collection in kilograms
                                                </FormDescription>
                                                <FormMessage className="text-red-400" />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Separator className="bg-[#01DE82]/20" />

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 bg-transparent border-[#01DE82]/30 text-white hover:bg-[#01DE82]/10 hover:border-[#01DE82] h-11"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#01DE82] hover:bg-[#01DE82]/90 text-black font-semibold h-11 disabled:opacity-50"
                                    disabled={isSubmitting || !form.formState.isValid}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Event"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
