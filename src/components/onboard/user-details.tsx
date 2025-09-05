"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationPicker } from "./location-picker"

interface UserDetailsProps {
    onNext: (data: {
        contactNo: string
        location: { latitude: number; longitude: number; locationName: string }
        gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"
        age: number
    }) => void
    onBack: () => void
}

export function UserDetails({ onNext, onBack }: UserDetailsProps) {
    const [formData, setFormData] = useState({
        contactNo: "",
        gender: "",
        age: ""
    })

    const [location, setLocation] = useState<{
        latitude: number
        longitude: number
        locationName: string
    } | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.contactNo || !formData.gender || !formData.age || !location) {
            return
        }

        onNext({
            contactNo: formData.contactNo,
            location,
            gender: formData.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY",
            age: parseInt(formData.age)
        })
    }

    const handleLocationSelect = (locationData: {
        latitude: number
        longitude: number
        locationName: string
    }) => {
        setLocation(locationData)
    }

    return (
        <Card className="max-w-2xl mx-auto bg-[#01DE82]/[0.03] backdrop-blur-3xl border border-[#01DE82]/20">
            <CardHeader>
                <CardTitle className="text-2xl text-center text-white">Your Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="contactNo" className="text-white">Contact Number *</Label>
                        <Input
                            id="contactNo"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.contactNo}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactNo: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                            required
                        />
                    </div>

                    <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        label="Primary Location"
                        placeholder="Enter your location or use current location"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender" className="text-white">Gender *</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                            >
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#020E0E] border-[#01DE82]/20">
                                    <SelectItem value="MALE" className="text-white hover:bg-[#01DE82]/20">Male</SelectItem>
                                    <SelectItem value="FEMALE" className="text-white hover:bg-[#01DE82]/20">Female</SelectItem>
                                    <SelectItem value="OTHER" className="text-white hover:bg-[#01DE82]/20">Other</SelectItem>
                                    <SelectItem value="PREFER_NOT_TO_SAY" className="text-white hover:bg-[#01DE82]/20">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age" className="text-white">Age *</Label>
                            <Input
                                id="age"
                                type="number"
                                min="13"
                                max="120"
                                placeholder="25"
                                value={formData.age}
                                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-[#01DE82] hover:bg-[#01DE82]/90 text-black"
                        >
                            Complete Setup
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}