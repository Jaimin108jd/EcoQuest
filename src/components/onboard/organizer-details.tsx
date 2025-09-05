"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocationPicker } from "./location-picker"

interface OrganizerDetailsProps {
    onNext: (data: {
        contactNo: string
        location: { latitude: number; longitude: number; locationName: string }
        ngo: {
            name: string
            contactNo: string
            location: { latitude: number; longitude: number; locationName: string }
            organizationSize: number
            establishmentYear: number
        }
    }) => void
    onBack: () => void
}

export function OrganizerDetails({ onNext, onBack }: OrganizerDetailsProps) {
    const [formData, setFormData] = useState({
        contactNo: "",
        ngoName: "",
        ngoContactNo: "",
        organizationSize: "",
        establishmentYear: ""
    })

    const [userLocation, setUserLocation] = useState<{
        latitude: number
        longitude: number
        locationName: string
    } | null>(null)

    const [ngoLocation, setNgoLocation] = useState<{
        latitude: number
        longitude: number
        locationName: string
    } | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.contactNo || !formData.ngoName || !formData.ngoContactNo ||
            !formData.organizationSize || !formData.establishmentYear ||
            !userLocation || !ngoLocation) {
            return
        }

        onNext({
            contactNo: formData.contactNo,
            location: userLocation,
            ngo: {
                name: formData.ngoName,
                contactNo: formData.ngoContactNo,
                location: ngoLocation,
                organizationSize: parseInt(formData.organizationSize),
                establishmentYear: parseInt(formData.establishmentYear)
            }
        })
    }

    const handleUserLocationSelect = (locationData: {
        latitude: number
        longitude: number
        locationName: string
    }) => {
        setUserLocation(locationData)
    }

    const handleNgoLocationSelect = (locationData: {
        latitude: number
        longitude: number
        locationName: string
    }) => {
        setNgoLocation(locationData)
    }

    return (
        <Card className="max-w-2xl mx-auto bg-[#01DE82]/[0.03] backdrop-blur-3xl border border-[#01DE82]/20">
            <CardHeader>
                <CardTitle className="text-2xl text-center text-white">Organizer Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Personal Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="contactNo" className="text-white">Your Contact Number *</Label>
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
                            onLocationSelect={handleUserLocationSelect}
                            label="Your Primary Location"
                            placeholder="Enter your location or use current location"
                        />
                    </div>

                    {/* NGO Details */}
                    <div className="space-y-4 border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-white">NGO Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="ngoName" className="text-white">NGO Name *</Label>
                            <Input
                                id="ngoName"
                                placeholder="Green Earth Foundation"
                                value={formData.ngoName}
                                onChange={(e) => setFormData(prev => ({ ...prev, ngoName: e.target.value }))}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ngoContactNo" className="text-white">NGO Contact Number *</Label>
                            <Input
                                id="ngoContactNo"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={formData.ngoContactNo}
                                onChange={(e) => setFormData(prev => ({ ...prev, ngoContactNo: e.target.value }))}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                required
                            />
                        </div>

                        <LocationPicker
                            onLocationSelect={handleNgoLocationSelect}
                            label="NGO Primary Location"
                            placeholder="Enter NGO location"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="organizationSize" className="text-white">Organization Size *</Label>
                                <Input
                                    id="organizationSize"
                                    type="number"
                                    min="1"
                                    placeholder="50"
                                    value={formData.organizationSize}
                                    onChange={(e) => setFormData(prev => ({ ...prev, organizationSize: e.target.value }))}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                    required
                                />
                                <p className="text-xs text-white/60">Number of people in your organization</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="establishmentYear" className="text-white">Establishment Year *</Label>
                                <Input
                                    id="establishmentYear"
                                    type="number"
                                    min="1800"
                                    max={new Date().getFullYear()}
                                    placeholder="2010"
                                    value={formData.establishmentYear}
                                    onChange={(e) => setFormData(prev => ({ ...prev, establishmentYear: e.target.value }))}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                    required
                                />
                            </div>
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