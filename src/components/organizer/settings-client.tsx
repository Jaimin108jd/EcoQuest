"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Settings,
    Building2,
    MapPin,
    Phone,
    Calendar,
    Users,
    Save,
    User,
    Lock,
    Mail,
    Shield,
    Activity,
    BarChart3,
    Eye,
    EyeOff
} from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"

const ngoUpdateSchema = z.object({
    name: z.string().min(1, "NGO name is required").max(255),
    contactNo: z.string().min(10, "Valid contact number is required").max(20),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    locationName: z.string().min(1, "Location name is required"),
    organizationSize: z.number().min(1, "Organization size must be at least 1"),
    establishmentYear: z.number().min(1800).max(new Date().getFullYear()),
})

type NGOUpdateForm = z.infer<typeof ngoUpdateSchema>

export function SettingsClient() {
    const [isEditing, setIsEditing] = useState(false)
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Fetch current user and NGO data
    const { data: currentUser, isLoading: userLoading } = useQuery(
        trpc.user.getCurrentUser.queryOptions()
    )

    const { data: ngoData, isLoading: ngoLoading } = useQuery(
        trpc.ngo.getMyNGO.queryOptions()
    )

    const { data: ngoStats, isLoading: statsLoading } = useQuery(
        trpc.ngo.getNGOStats.queryOptions()
    )

    // Form setup
    const form = useForm<NGOUpdateForm>({
        resolver: zodResolver(ngoUpdateSchema),
        defaultValues: ngoData ? {
            name: ngoData.name,
            contactNo: ngoData.contactNo,
            latitude: ngoData.latitude,
            longitude: ngoData.longitude,
            locationName: ngoData.locationName,
            organizationSize: ngoData.organizationSize,
            establishmentYear: ngoData.establishmentYear,
        } : undefined
    })

    // Update form when data loads
    useEffect(() => {
        if (ngoData) {
            form.reset({
                name: ngoData.name,
                contactNo: ngoData.contactNo,
                latitude: ngoData.latitude,
                longitude: ngoData.longitude,
                locationName: ngoData.locationName,
                organizationSize: ngoData.organizationSize,
                establishmentYear: ngoData.establishmentYear,
            })
        }
    }, [ngoData, form])

    // Mutations
    const updateNGOMutation = useMutation({
        ...trpc.ngo.updateNGO.mutationOptions(),
        onSuccess: () => {
            toast.success("NGO details updated successfully!")
            setIsEditing(false)
            queryClient.invalidateQueries({ queryKey: trpc.ngo.getMyNGO.queryKey() })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update NGO details")
        }
    })

    const onSubmit = (data: NGOUpdateForm) => {
        updateNGOMutation.mutate(data)
    }

    if (userLoading || ngoLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-[#01DE82]/20 animate-pulse rounded-md w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-96 bg-[#01DE82]/20 animate-pulse rounded-lg" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-64 bg-[#01DE82]/20 animate-pulse rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 px-4 py-3">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-[#01DE82]" />
                    <span>Settings</span>
                </h1>
                <p className="text-white/70">Manage your organization and account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="organization" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 bg-[#020E0E] border border-[#01DE82]/20">
                            <TabsTrigger value="organization" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                                Organization
                            </TabsTrigger>
                            <TabsTrigger value="account" className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80">
                                Account (Read-only)
                            </TabsTrigger>
                        </TabsList>

                        {/* Organization Settings */}
                        <TabsContent value="organization">
                            <Card className="bg-white/5 border-[#01DE82]/20">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white flex items-center space-x-2">
                                                <Building2 className="h-5 w-5 text-[#01DE82]" />
                                                <span>Organization Details</span>
                                            </CardTitle>
                                            <CardDescription className="text-white/60">
                                                Update your NGO information and contact details
                                            </CardDescription>
                                        </div>
                                        {!isEditing ? (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                className="bg-[#01DE82] hover:bg-[#01DE82]/80 text-[#020E0E]"
                                            >
                                                Edit Details
                                            </Button>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditing(false)
                                                        form.reset()
                                                    }}
                                                    className="border-[#01DE82]/30 text-white hover:bg-white/10"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={form.handleSubmit(onSubmit)}
                                                    disabled={updateNGOMutation.isPending}
                                                    className="bg-[#01DE82] hover:bg-[#01DE82]/80 text-[#020E0E]"
                                                >
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {updateNGOMutation.isPending ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {ngoData && (
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            {/* NGO Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-white/80">Organization Name</Label>
                                                <Input
                                                    id="name"
                                                    {...form.register("name")}
                                                    disabled={!isEditing}
                                                    className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] disabled:opacity-60"
                                                />
                                                {form.formState.errors.name && (
                                                    <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
                                                )}
                                            </div>

                                            {/* Contact Number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="contactNo" className="text-white/80">Contact Number</Label>
                                                <Input
                                                    id="contactNo"
                                                    {...form.register("contactNo")}
                                                    disabled={!isEditing}
                                                    className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] disabled:opacity-60"
                                                />
                                                {form.formState.errors.contactNo && (
                                                    <p className="text-red-400 text-sm">{form.formState.errors.contactNo.message}</p>
                                                )}
                                            </div>

                                            {/* Location */}
                                            <div className="space-y-2">
                                                <Label htmlFor="locationName" className="text-white/80">Location</Label>
                                                <Input
                                                    id="locationName"
                                                    {...form.register("locationName")}
                                                    disabled={!isEditing}
                                                    className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] disabled:opacity-60"
                                                />
                                                {form.formState.errors.locationName && (
                                                    <p className="text-red-400 text-sm">{form.formState.errors.locationName.message}</p>
                                                )}
                                            </div>

                                            {/* Coordinates */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="latitude" className="text-white/80">Latitude</Label>
                                                    <Input
                                                        id="latitude"
                                                        type="number"
                                                        step="any"
                                                        {...form.register("latitude", { valueAsNumber: true })}
                                                        disabled={!isEditing}
                                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] disabled:opacity-60"
                                                    />
                                                    {form.formState.errors.latitude && (
                                                        <p className="text-red-400 text-sm">{form.formState.errors.latitude.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="longitude" className="text-white/80">Longitude</Label>
                                                    <Input
                                                        id="longitude"
                                                        type="number"
                                                        step="any"
                                                        {...form.register("longitude", { valueAsNumber: true })}
                                                        disabled={!isEditing}
                                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] disabled:opacity-60"
                                                    />
                                                    {form.formState.errors.longitude && (
                                                        <p className="text-red-400 text-sm">{form.formState.errors.longitude.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Organization Details */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="organizationSize" className="text-white/80">Organization Size</Label>
                                                    <Input
                                                        id="organizationSize"
                                                        type="number"
                                                        {...form.register("organizationSize", { valueAsNumber: true })}
                                                        disabled={!isEditing}
                                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] disabled:opacity-60"
                                                    />
                                                    {form.formState.errors.organizationSize && (
                                                        <p className="text-red-400 text-sm">{form.formState.errors.organizationSize.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="establishmentYear" className="text-white/80">Establishment Year</Label>
                                                    <Input
                                                        id="establishmentYear"
                                                        type="number"
                                                        {...form.register("establishmentYear", { valueAsNumber: true })}
                                                        disabled={!isEditing}
                                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] disabled:opacity-60"
                                                    />
                                                    {form.formState.errors.establishmentYear && (
                                                        <p className="text-red-400 text-sm">{form.formState.errors.establishmentYear.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Account Settings (Read-only) */}
                        <TabsContent value="account">
                            <Card className="bg-white/5 border-[#01DE82]/20">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center space-x-2">
                                        <User className="h-5 w-5 text-[#01DE82]" />
                                        <span>Account Information</span>
                                    </CardTitle>
                                    <CardDescription className="text-white/60">
                                        Your personal account details (read-only)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {currentUser && (
                                        <>
                                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                                                    <Lock className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Personal Information Locked</span>
                                                </div>
                                                <p className="text-white/70 text-sm">
                                                    Personal account details cannot be changed from the dashboard.
                                                    Please contact your authentication provider to update personal information.
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-white/80">First Name</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Input
                                                                value={currentUser.firstName}
                                                                disabled
                                                                className="bg-[#020E0E]/30 border-[#01DE82]/20 text-white/60"
                                                            />
                                                            <EyeOff className="h-4 w-4 text-white/40" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-white/80">Last Name</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Input
                                                                value={currentUser.lastName}
                                                                disabled
                                                                className="bg-[#020E0E]/30 border-[#01DE82]/20 text-white/60"
                                                            />
                                                            <EyeOff className="h-4 w-4 text-white/40" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-white/80">Email Address</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            value={currentUser.email}
                                                            disabled
                                                            className="bg-[#020E0E]/30 border-[#01DE82]/20 text-white/60"
                                                        />
                                                        <Mail className="h-4 w-4 text-white/40" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-white/80">Role</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className="bg-[#01DE82]/20 text-[#01DE82] border-[#01DE82]/30">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            {currentUser.role}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-white/80">Account Created</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            value={format(new Date(currentUser.createdAt), "PPP")}
                                                            disabled
                                                            className="bg-[#020E0E]/30 border-[#01DE82]/20 text-white/60"
                                                        />
                                                        <Calendar className="h-4 w-4 text-white/40" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Organization Overview */}
                    <Card className="bg-white/5 border-[#01DE82]/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                                <Activity className="h-5 w-5 text-[#01DE82]" />
                                <span>Organization Overview</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ngoData && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70">Name</span>
                                        <span className="text-white font-medium">{ngoData.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70">Established</span>
                                        <span className="text-white font-medium">{ngoData.establishmentYear}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70">Size</span>
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                            {ngoData.organizationSize} members
                                        </Badge>
                                    </div>
                                    <Separator className="bg-white/10" />
                                    <div className="flex items-center space-x-2 text-white/70">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">{ngoData.locationName}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-white/70">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-sm">{ngoData.contactNo}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* NGO Statistics */}
                    {ngoStats && (
                        <Card className="bg-white/5 border-[#01DE82]/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5 text-[#01DE82]" />
                                    <span>NGO Statistics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-[#01DE82]/10 rounded-lg border border-[#01DE82]/20">
                                        <p className="text-2xl font-bold text-[#01DE82]">{ngoStats.totalEvents}</p>
                                        <p className="text-white/60 text-xs">Total Events</p>
                                    </div>
                                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <p className="text-2xl font-bold text-blue-400">{ngoStats.totalParticipants}</p>
                                        <p className="text-white/60 text-xs">Participants</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <p className="text-xl font-bold text-green-400">{ngoStats.totalWasteCollected.toFixed(1)}</p>
                                        <p className="text-white/60 text-xs">kg Waste</p>
                                    </div>
                                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                        <p className="text-xl font-bold text-yellow-400">{ngoStats.averageRating.toFixed(1)}</p>
                                        <p className="text-white/60 text-xs">Avg Rating</p>
                                    </div>
                                </div>
                                <Separator className="bg-white/10" />
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70 text-sm">Active Organizers</span>
                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {ngoStats.totalOrganizers}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70 text-sm">Total Feedback</span>
                                        <span className="text-white font-medium">{ngoStats.totalFeedbacks}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
