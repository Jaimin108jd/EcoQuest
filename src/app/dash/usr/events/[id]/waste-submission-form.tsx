"use client"

import { useState } from "react"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Upload, Camera, MapPin, Trash2, Award, X, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { put } from '@vercel/blob'

interface WasteSubmissionFormProps {
    eventId: number
    onSuccess: () => void
}

interface ImageUpload {
    file: File | null
    preview: string | null
    url: string | null
    uploading: boolean
}

export default function WasteSubmissionForm({ eventId, onSuccess }: WasteSubmissionFormProps) {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        wasteCollectedKg: '',
        wasteDescription: '',
        collectionLocation: '',
        collectionLatitude: undefined as number | undefined,
        collectionLongitude: undefined as number | undefined,
    })

    const [beforeImage, setBeforeImage] = useState<ImageUpload>({
        file: null, preview: null, url: null, uploading: false
    })
    const [afterImage, setAfterImage] = useState<ImageUpload>({
        file: null, preview: null, url: null, uploading: false
    })
    const [wasteImages, setWasteImages] = useState<ImageUpload[]>([])

    const submitParticipationMutation = useMutation({
        ...trpc.events.submitParticipation.mutationOptions(),
        onSuccess: () => {
            toast.success("🎉 Waste collection submitted successfully! You've earned XP!")
            queryClient.invalidateQueries({ queryKey: trpc.events.getById.queryKey() })
            onSuccess()
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to submit waste collection")
        }
    })

    const uploadImage = async (file: File, type: 'before' | 'after' | 'waste', index?: number): Promise<string> => {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB")
            throw new Error("File too large")
        }

        try {
            const timestamp = Date.now()
            const filename = `${type}-${timestamp}-${file.name}`

            const blob = await put(filename, file, {
                access: 'public',
            })

            return blob.url
        } catch (error) {
            toast.error("Failed to upload image")
            throw error
        }
    }

    const handleImageUpload = async (
        file: File,
        type: 'before' | 'after' | 'waste',
        index?: number
    ) => {
        const preview = URL.createObjectURL(file)

        if (type === 'before') {
            setBeforeImage(prev => ({ ...prev, file, preview, uploading: true }))
        } else if (type === 'after') {
            setAfterImage(prev => ({ ...prev, file, preview, uploading: true }))
        } else if (type === 'waste' && index !== undefined) {
            setWasteImages(prev => {
                const newImages = [...prev]
                newImages[index] = { file, preview, url: null, uploading: true }
                return newImages
            })
        }

        try {
            const url = await uploadImage(file, type, index)

            if (type === 'before') {
                setBeforeImage(prev => ({ ...prev, url, uploading: false }))
            } else if (type === 'after') {
                setAfterImage(prev => ({ ...prev, url, uploading: false }))
            } else if (type === 'waste' && index !== undefined) {
                setWasteImages(prev => {
                    const newImages = [...prev]
                    newImages[index] = { ...newImages[index], url, uploading: false }
                    return newImages
                })
            }

            toast.success("Image uploaded successfully!")
        } catch (error) {
            if (type === 'before') {
                setBeforeImage({ file: null, preview: null, url: null, uploading: false })
            } else if (type === 'after') {
                setAfterImage({ file: null, preview: null, url: null, uploading: false })
            } else if (type === 'waste' && index !== undefined) {
                setWasteImages(prev => prev.filter((_, i) => i !== index))
            }
        }
    }

    const addWasteImageSlot = () => {
        if (wasteImages.length < 5) {
            setWasteImages(prev => [...prev, { file: null, preview: null, url: null, uploading: false }])
        }
    }

    const removeWasteImage = (index: number) => {
        setWasteImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.wasteCollectedKg || parseFloat(formData.wasteCollectedKg) < 0.1) {
            toast.error("Please enter at least 0.1kg of waste collected")
            return
        }

        // Check if any images are still uploading
        const isUploading = beforeImage.uploading || afterImage.uploading ||
            wasteImages.some(img => img.uploading)

        if (isUploading) {
            toast.error("Please wait for images to finish uploading")
            return
        }

        const wasteImageUrls = wasteImages
            .filter(img => img.url)
            .map(img => img.url!)

        try {
            submitParticipationMutation.mutate({
                eventId,
                wasteCollectedKg: parseFloat(formData.wasteCollectedKg),
                wasteDescription: formData.wasteDescription || undefined,
                collectionLocation: formData.collectionLocation || undefined,
                proofImageUrl: beforeImage.url || undefined,
                afterImageUrl: afterImage.url || undefined,
                wasteImageUrls,
                collectionLatitude: formData.collectionLatitude,
                collectionLongitude: formData.collectionLongitude,
            })
        } catch (error) {
            // Error handling is done in the mutation's onError
        }
    }

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        collectionLatitude: position.coords.latitude,
                        collectionLongitude: position.coords.longitude
                    }))
                    toast.success("📍 Location captured!")
                },
                (error) => {
                    toast.error("Failed to get location. Please check your permissions.")
                }
            )
        } else {
            toast.error("Geolocation is not supported by this browser.")
        }
    }

    const calculateXP = (weight: number) => {
        const baseXP = 50
        const bonusXP = Math.floor(weight * 5)
        return baseXP + bonusXP
    }

    const estimatedXP = formData.wasteCollectedKg ? calculateXP(parseFloat(formData.wasteCollectedKg)) : 0

    return (
        <div className="space-y-6 pt-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Weight Input */}
                <Card className="bg-gradient-to-br from-[#05614B]/20 to-gray-900/40 border-[#01DE82]/30">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-[#01DE82] flex items-center space-x-2">
                            <Trash2 className="h-5 w-5" />
                            <span>Waste Collection Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight" className="text-gray-200 font-medium">
                                Waste Collected (kg) *
                            </Label>
                            <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                min="0.1"
                                placeholder="e.g., 2.5"
                                value={formData.wasteCollectedKg}
                                onChange={(e) => setFormData(prev => ({ ...prev, wasteCollectedKg: e.target.value }))}
                                className="bg-gray-800/50 border-[#01DE82]/30 text-white placeholder:text-gray-400 focus:border-[#01DE82] focus:ring-[#01DE82]/20"
                                required
                            />
                            {estimatedXP > 0 && (
                                <div className="flex items-center space-x-2 p-3 bg-[#01DE82]/10 rounded-lg border border-[#01DE82]/30">
                                    <Award className="h-5 w-5 text-[#01DE82]" />
                                    <span className="text-[#01DE82] font-medium">
                                        You'll earn {estimatedXP} XP!
                                        <span className="text-gray-300 text-sm ml-2">
                                            (50 base + {Math.floor(parseFloat(formData.wasteCollectedKg || '0') * 5)} bonus)
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-200 font-medium">
                                Waste Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the type of waste collected (e.g., plastic bottles, paper, food packaging...)"
                                value={formData.wasteDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, wasteDescription: e.target.value }))}
                                className="bg-gray-800/50 border-[#01DE82]/30 text-white placeholder:text-gray-400 focus:border-[#01DE82] focus:ring-[#01DE82]/20 resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-gray-200 font-medium">
                                Collection Location
                            </Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="location"
                                    placeholder="e.g., Park entrance, Beach area, Street corner..."
                                    value={formData.collectionLocation}
                                    onChange={(e) => setFormData(prev => ({ ...prev, collectionLocation: e.target.value }))}
                                    className="flex-1 bg-gray-800/50 border-[#01DE82]/30 text-white placeholder:text-gray-400 focus:border-[#01DE82] focus:ring-[#01DE82]/20"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={getCurrentLocation}
                                    disabled={!!formData.collectionLatitude}
                                    className="border-[#01DE82]/50 text-[#01DE82] hover:bg-[#01DE82]/10 hover:border-[#01DE82]"
                                >
                                    <MapPin className="h-4 w-4" />
                                </Button>
                            </div>
                            {formData.collectionLatitude && formData.collectionLongitude && (
                                <div className="flex items-center space-x-2 text-[#01DE82] text-sm">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>GPS coordinates captured</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Image Upload Section */}
                <Card className="bg-gradient-to-br from-[#05614B]/20 to-gray-900/40 border-[#01DE82]/30">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-[#01DE82] flex items-center space-x-2">
                            <Camera className="h-5 w-5" />
                            <span>Evidence Photos</span>
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Upload photos to document your waste collection (Max 5MB per image)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Before Image */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 font-medium">Site Before Cleanup</Label>
                            <div className="relative">
                                {beforeImage.preview ? (
                                    <div className="relative group">
                                        <img
                                            src={beforeImage.preview}
                                            alt="Before cleanup"
                                            className="w-full h-32 object-cover rounded-lg border border-[#01DE82]/30"
                                        />
                                        {beforeImage.uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                                <div className="text-[#01DE82]">Uploading...</div>
                                            </div>
                                        )}
                                        {beforeImage.url && (
                                            <div className="absolute top-2 right-2 bg-[#01DE82] rounded-full p-1">
                                                <CheckCircle className="h-4 w-4 text-black" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setBeforeImage({ file: null, preview: null, url: null, uploading: false })}
                                            className="absolute top-2 left-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#01DE82]/50 rounded-lg cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-[#01DE82]" />
                                            <p className="text-sm text-gray-300">Click to upload before photo</p>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleImageUpload(file, 'before')
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* After Image */}
                        <div className="space-y-3">
                            <Label className="text-gray-200 font-medium">Site After Cleanup</Label>
                            <div className="relative">
                                {afterImage.preview ? (
                                    <div className="relative group">
                                        <img
                                            src={afterImage.preview}
                                            alt="After cleanup"
                                            className="w-full h-32 object-cover rounded-lg border border-[#01DE82]/30"
                                        />
                                        {afterImage.uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                                <div className="text-[#01DE82]">Uploading...</div>
                                            </div>
                                        )}
                                        {afterImage.url && (
                                            <div className="absolute top-2 right-2 bg-[#01DE82] rounded-full p-1">
                                                <CheckCircle className="h-4 w-4 text-black" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setAfterImage({ file: null, preview: null, url: null, uploading: false })}
                                            className="absolute top-2 left-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#01DE82]/50 rounded-lg cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-[#01DE82]" />
                                            <p className="text-sm text-gray-300">Click to upload after photo</p>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleImageUpload(file, 'after')
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Waste Images */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-200 font-medium">Waste Collection Photos</Label>
                                <span className="text-xs text-gray-400">({wasteImages.length}/5)</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {wasteImages.map((image, index) => (
                                    <div key={index} className="relative">
                                        {image.preview ? (
                                            <div className="relative group">
                                                <img
                                                    src={image.preview}
                                                    alt={`Waste ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-[#01DE82]/30"
                                                />
                                                {image.uploading && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                                        <div className="text-[#01DE82] text-xs">Uploading...</div>
                                                    </div>
                                                )}
                                                {image.url && (
                                                    <div className="absolute top-1 right-1 bg-[#01DE82] rounded-full p-0.5">
                                                        <CheckCircle className="h-3 w-3 text-black" />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeWasteImage(index)}
                                                    className="absolute top-1 left-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#01DE82]/50 rounded-lg cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                                <Upload className="w-4 h-4 mb-1 text-[#01DE82]" />
                                                <p className="text-xs text-gray-300">Upload</p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleImageUpload(file, 'waste', index)
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                ))}

                                {wasteImages.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={addWasteImageSlot}
                                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#01DE82]/30 rounded-lg bg-gray-800/20 hover:bg-gray-800/40 transition-colors text-[#01DE82]"
                                    >
                                        <Camera className="w-4 h-4 mb-1" />
                                        <p className="text-xs">Add Photo</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={
                        !formData.wasteCollectedKg ||
                        parseFloat(formData.wasteCollectedKg) < 0.1 ||
                        submitParticipationMutation.isPending ||
                        beforeImage.uploading ||
                        afterImage.uploading ||
                        wasteImages.some(img => img.uploading)
                    }
                    className="w-full bg-gradient-to-r from-[#01DE82] to-[#05614B] text-black font-bold py-3 hover:from-[#01DE82]/90 hover:to-[#05614B]/90 transition-all duration-300 shadow-lg hover:shadow-[#01DE82]/25"
                >
                    {submitParticipationMutation.isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Submit Waste Collection & Earn {estimatedXP} XP
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
