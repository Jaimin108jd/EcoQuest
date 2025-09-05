"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, Navigation, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import * as motion from "motion/react-client"

interface LocationData {
    latitude: number
    longitude: number
    locationName: string
}

interface LocationPickerProps {
    onLocationSelect: (location: LocationData) => void
    initialLocation?: LocationData
    label?: string
    placeholder?: string
    className?: string
}

export function LocationPicker({
    onLocationSelect,
    initialLocation,
    label = "Location",
    placeholder = "Enter location or use current location",
    className = ""
}: LocationPickerProps) {
    const [location, setLocation] = useState<LocationData | null>(initialLocation || null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState<LocationData[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Debounced search for location suggestions
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.length > 2) {
                searchLocation(searchQuery)
            } else {
                setSuggestions([])
                setShowSuggestions(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    const getCurrentLocation = async () => {
        setIsLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser")
            setIsLoading(false)
            return
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                })
            })
            console.log("Geolocation position:", position)

            const { latitude, longitude } = position.coords

            // Reverse geocoding to get location name
            const locationName = await reverseGeocode(latitude, longitude)

            const locationData: LocationData = {
                latitude,
                longitude,
                locationName
            }

            setLocation(locationData)
            setSearchQuery(locationName)
            onLocationSelect(locationData)
        } catch (error) {
            console.error("Error getting location:", error)
            setError("Unable to get your current location. Please enter manually.")
        } finally {
            setIsLoading(false)
        }
    }

    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            // Using OpenStreetMap Nominatim API for reverse geocoding (free)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'EcoQuest App'
                    }
                }
            )

            if (!response.ok) {
                throw new Error("Failed to fetch location details")
            }

            const data = await response.json()
            console.log("Reverse geocoding data:", data)

            // Format location name from address components
            const address = data.address || {}
            const parts = []

            if (address.city || address.town || address.village) {
                parts.push(address.city || address.town || address.village)
            }
            if (address.state) {
                parts.push(address.state)
            }
            if (address.country) {
                parts.push(address.country)
            }

            return parts.length > 0 ? parts.join(", ") : data.display_name || "Unknown Location"
        } catch (error) {
            console.error("Reverse geocoding error:", error)
            return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }
    }

    const searchLocation = async (query: string) => {
        try {
            setError(null)
            setIsSearching(true)
            // Using OpenStreetMap Nominatim API for geocoding (free)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`,
                {
                    headers: {
                        'User-Agent': 'EcoQuest App'
                    }
                }
            )

            if (!response.ok) {
                throw new Error("Failed to search locations")
            }

            const data = await response.json()

            const locations: LocationData[] = data.map((item: any) => ({
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                locationName: item.display_name
            }))

            setSuggestions(locations)
            setShowSuggestions(locations.length > 0)

            if (locations.length === 0 && query.length > 2) {
                setError("No locations found. Try a different search term.")
            }
        } catch (error) {
            console.error("Location search error:", error)
            setSuggestions([])
            setShowSuggestions(false)
            setError("Unable to search locations. Please check your internet connection.")
        } finally {
            setIsSearching(false)
        }
    }

    const handleSuggestionSelect = (suggestion: LocationData) => {
        setLocation(suggestion)
        setSearchQuery(suggestion.locationName)
        setShowSuggestions(false)
        onLocationSelect(suggestion)
    }

    const handleManualInput = () => {
        if (searchQuery.trim()) {
            // If user types something manually, treat it as a location
            const manualLocation: LocationData = {
                latitude: 0, // Will be updated when we get coordinates
                longitude: 0,
                locationName: searchQuery.trim()
            }
            setLocation(manualLocation)
            onLocationSelect(manualLocation)
            setShowSuggestions(false)
        }
    }

    return (
        <div className={`space-y-2 relative ${className}`}>
            <Label htmlFor="location-picker" className="text-white">
                {label} *
            </Label>

            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="location-picker"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setShowSuggestions(true)
                                setError(null)
                            }}
                            onBlur={() => {
                                // Delay hiding suggestions to allow clicking
                                setTimeout(() => setShowSuggestions(false), 200)
                            }}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleManualInput()
                                }
                                if (e.key === 'Escape') {
                                    setShowSuggestions(false)
                                }
                            }}
                            placeholder={placeholder}
                            className="bg-[#020E0E]/50 border-[#01DE82]/30 text-white placeholder:text-white/50 focus:border-[#01DE82] focus:ring-1 focus:ring-[#01DE82]/50 pr-10"
                            disabled={isLoading}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        {isSearching && (
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="w-4 h-4 animate-spin text-[#01DE82]" />
                            </div>
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={isLoading}
                        className="shrink-0 bg-[#01DE82]/10 border-[#01DE82]/40 text-[#01DE82] hover:bg-[#01DE82]/20 hover:border-[#01DE82] disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Use current location"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Navigation className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                {/* Location Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 z-50 mt-1"
                    >
                        <div className="bg-[#020E0E]/95 backdrop-blur-xl border border-[#01DE82]/30 rounded-lg shadow-2xl overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <motion.button
                                        key={index}
                                        type="button"
                                        className="w-full text-left p-3 hover:bg-[#01DE82]/20 text-white/90 text-sm transition-all duration-200 border-b border-[#01DE82]/10 last:border-b-0 focus:bg-[#01DE82]/20 focus:outline-none"
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                        whileHover={{ backgroundColor: "rgba(1, 222, 130, 0.15)" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-[#01DE82] shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <span className="block truncate text-white/90">{suggestion.locationName}</span>
                                                <span className="block text-xs text-white/60 mt-0.5">
                                                    {suggestion.latitude.toFixed(4)}, {suggestion.longitude.toFixed(4)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Current Location Display */}
            {location && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-[#01DE82]/5 border border-[#01DE82]/20 rounded-lg backdrop-blur-sm"
                >
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#01DE82]" />
                        <span className="text-white/90 font-medium">Selected Location</span>
                    </div>
                    <div className="text-sm text-white/80 mt-1 pl-6">
                        {location.locationName}
                    </div>
                    {location.latitude !== 0 && location.longitude !== 0 && (
                        <div className="text-xs text-white/50 mt-1 pl-6 font-mono">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm"
                >
                    {error}
                </motion.div>
            )}

            <p className="text-xs text-white/60">
                Click the location icon to use your current location or type to search
            </p>
        </div>
    )
}
