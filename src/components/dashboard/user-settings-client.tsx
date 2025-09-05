"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Settings,
    User,
    MapPin,
    Mail,
    Shield,
    Bell,
    Palette,
    LogOut
} from "lucide-react"
import { toast } from "sonner"

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
    latitude?: number | null
    longitude?: number | null
    locationName?: string | null
    isOnBoarded: boolean
    createdAt: Date
}

interface UserSettingsClientProps {
    user: User
}

export function UserSettingsClient({ user }: UserSettingsClientProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        locationName: user.locationName || "",
    })

    const handleSave = () => {
        // TODO: Implement save functionality with tRPC
        toast.success("Settings updated successfully!")
        setIsEditing(false)
    }

    const handleCancel = () => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            locationName: user.locationName || "",
        })
        setIsEditing(false)
    }

    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-white/70 mt-1">
                        Manage your account preferences and information
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-xl flex items-center gap-2">
                                    <User className="h-5 w-5 text-[#01DE82]" />
                                    Profile Information
                                </CardTitle>
                                {!isEditing ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="border-[#01DE82]/40 text-[#01DE82] hover:bg-[#01DE82]/10"
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                            className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSave}
                                            className="bg-gradient-to-r from-[#01DE82] to-[#00B86B] text-black font-semibold"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                        disabled={!isEditing}
                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                        disabled={!isEditing}
                                        className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-white">Email Address</Label>
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="bg-[#020E0E]/30 border-[#01DE82]/20 text-white/70 cursor-not-allowed"
                                />
                                <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <Label htmlFor="location" className="text-white">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.locationName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                                    placeholder="Enter your location"
                                    disabled={!isEditing}
                                    className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white disabled:opacity-60"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                        <CardHeader>
                            <CardTitle className="text-white text-xl flex items-center gap-2">
                                <Settings className="h-5 w-5 text-[#01DE82]" />
                                Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#01DE82]/10 rounded-lg border border-[#01DE82]/20">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-[#01DE82]" />
                                    <div>
                                        <p className="text-white font-medium">Email Notifications</p>
                                        <p className="text-white/70 text-sm">Receive updates about events and activities</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#01DE82]/40 text-[#01DE82] hover:bg-[#01DE82]/10"
                                >
                                    Enabled
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#020E0E]/50 rounded-lg border border-[#01DE82]/10">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-white/70" />
                                    <div>
                                        <p className="text-white font-medium">Location Services</p>
                                        <p className="text-white/70 text-sm">Allow location-based event recommendations</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/20 text-white/70 hover:bg-white/10"
                                >
                                    Configure
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#020E0E]/50 rounded-lg border border-[#01DE82]/10">
                                <div className="flex items-center gap-3">
                                    <Palette className="h-5 w-5 text-white/70" />
                                    <div>
                                        <p className="text-white font-medium">Theme Preferences</p>
                                        <p className="text-white/70 text-sm">Customize your dashboard appearance</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/20 text-white/70 hover:bg-white/10"
                                >
                                    Dark Mode
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Overview */}
                <div className="space-y-6">
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-[#01DE82]" />
                                Account Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#01DE82] to-[#05614B] rounded-full flex items-center justify-center text-black font-bold text-lg">
                                    {user.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-white/70 text-sm">{user.email}</p>
                                </div>
                            </div>

                            <Separator className="bg-[#01DE82]/20" />

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Account Type</span>
                                    <Badge className="bg-[#01DE82]/20 text-[#01DE82] border-[#01DE82]/30">
                                        {user.role === "ORGANISER" ? "Organizer" : "Member"}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Status</span>
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                        Active
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Member Since</span>
                                    <span className="text-white text-sm">{joinDate}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Location</span>
                                    <span className="text-white text-sm">
                                        {user.locationName || "Not set"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Actions */}
                    <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Account Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                            >
                                Change Password
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                            >
                                Download Data
                            </Button>

                            <Separator className="bg-red-500/20" />

                            <Button
                                variant="outline"
                                className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full border-red-500/60 text-red-400 hover:bg-red-500/20"
                            >
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
