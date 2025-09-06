"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    CheckCircle,
    XCircle,
    Clock,
    Award,
    MapPin,
    Weight,
    Image as ImageIcon,
    Eye,
    Star,
    FileText,
    Calendar
} from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import Image from "next/image"

interface ParticipationReviewProps {
    eventId: number
    eventTitle: string
}

export function ParticipationReview({ eventId, eventTitle }: ParticipationReviewProps) {
    const [bonusXP, setBonusXP] = useState(0)
    const [filterTab, setFilterTab] = useState<"pending" | "verified" | "all">("pending")
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedParticipation, setSelectedParticipation] = useState<any>(null)

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    // Get participations for review with proper query key management and auto-refresh
    const { data: participations, isLoading, error } = useQuery({
        ...trpc.events.getParticipationsForReview.queryOptions({
            eventId,
            verified: filterTab === "pending" ? false : filterTab === "verified" ? true : undefined
        }),
        refetchInterval: 3000,
        refetchIntervalInBackground: true
    })

    // Verify participation mutation with better invalidation
    const verifyMutation = useMutation({
        ...trpc.events.verifyParticipation.mutationOptions(),
        onSuccess: () => {
            toast.success("Participation verified successfully!")
            // Keep sheet open but refresh data
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to verify participation")
        }
    })

    const handleVerify = (participationId: number, isVerified: boolean) => {
        verifyMutation.mutate({
            participationId,
            isVerified,
            bonusXP: isVerified ? bonusXP : 0
        })
    }

    const openReviewSheet = (participation: any) => {
        setSelectedParticipation(participation)
        setBonusXP(0)
        setIsSheetOpen(true)
    }

    const closeSheet = () => {
        setIsSheetOpen(false)
        setSelectedParticipation(null)
        setBonusXP(0)
    }

    // Filter participations based on current tab
    const filteredParticipations = participations?.filter(p => {
        if (filterTab === "pending") return !p.isVerified
        if (filterTab === "verified") return p.isVerified
        return true // "all" tab
    }) || []

    if (isLoading) {
        return (
            <div className="bg-[#020E0E] border border-[#01DE82]/20 rounded-lg">
                <div className="p-6 border-b border-[#01DE82]/20">
                    <h2 className="text-xl font-bold text-[#01DE82] flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Participation Review - Loading...
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-[#01DE82]/10 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-[#020E0E] border border-red-500/20 rounded-lg">
                <div className="p-6 border-b border-red-500/20">
                    <h2 className="text-xl font-bold text-red-400">Error Loading Submissions</h2>
                </div>
                <div className="p-6">
                    <p className="text-red-300">Error: {error.message}</p>
                    <p className="text-white/60 mt-2">Event ID: {eventId}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#020E0E] border border-[#01DE82]/20 rounded-lg">
            <div className="p-6 border-b border-[#01DE82]/20">
                <h2 className="text-xl font-bold text-[#01DE82] flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Participation Review - {eventTitle}
                </h2>
            </div>

            <div className="p-6">
                <Tabs value={filterTab} onValueChange={(value: any) => setFilterTab(value)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-[#020E0E] border border-[#01DE82]/20 mb-6">
                        <TabsTrigger
                            value="pending"
                            className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80"
                        >
                            Pending ({participations?.filter(p => !p.isVerified).length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="verified"
                            className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80"
                        >
                            Verified ({participations?.filter(p => p.isVerified).length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-[#01DE82] data-[state=active]:text-[#020E0E] text-white/80"
                        >
                            All ({participations?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={filterTab} className="mt-0">
                        {filteredParticipations.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                                <Clock className="h-12 w-12 text-white/40 mx-auto mb-4" />
                                <p className="text-white/60 text-lg">No {filterTab === "all" ? "" : filterTab} submissions found</p>
                                <p className="text-white/40 text-sm mt-2">
                                    {filterTab === "pending" && "Approved submissions will appear in the verified tab"}
                                    {filterTab === "verified" && "Verified submissions will appear here after approval"}
                                    {filterTab === "all" && "Submissions will appear here once participants upload their waste collection proof"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredParticipations.map((participation) => (
                                    <div
                                        key={participation.id}
                                        className="bg-white/5 hover:bg-white/8 border border-white/10 hover:border-[#01DE82]/30 rounded-lg transition-all duration-200"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-[#01DE82]/30 flex-shrink-0">
                                                    <AvatarImage src={participation.user.picture || undefined} />
                                                    <AvatarFallback className="bg-[#01DE82]/20 text-[#01DE82] font-bold">
                                                        {participation.user.firstName[0]}{participation.user.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-white truncate">
                                                            {participation.user.firstName} {participation.user.lastName}
                                                        </h3>
                                                        <Badge
                                                            variant={participation.isVerified ? "default" : "secondary"}
                                                            className={participation.isVerified
                                                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}
                                                        >
                                                            {participation.isVerified ? "Verified" : "Pending"}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-sm">
                                                        <div className="flex items-center gap-2 text-white/80">
                                                            <Weight className="h-4 w-4 text-[#01DE82] flex-shrink-0" />
                                                            <span className="truncate">{participation.wasteCollectedKg}kg</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-white/80">
                                                            <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                                            <span className="truncate">{participation.xpEarned} XP</span>
                                                        </div>
                                                        {participation.collectionLocation && (
                                                            <div className="flex items-center gap-2 text-white/80 col-span-2 lg:col-span-1">
                                                                <MapPin className="h-4 w-4 text-[#01DE82] flex-shrink-0" />
                                                                <span className="truncate">{participation.collectionLocation}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-white/60">
                                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                                            <span className="truncate">{format(new Date(participation.createdAt), "MMM d, h:mm a")}</span>
                                                        </div>
                                                    </div>

                                                    {participation.wasteDescription && (
                                                        <p className="text-sm text-white/70 bg-white/5 p-3 rounded border border-white/10 mb-3 line-clamp-2">
                                                            {participation.wasteDescription}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {(participation.wasteImageUrls?.length > 0 || participation.proofImageUrl || participation.afterImageUrl) && (
                                                                <div className="flex items-center gap-2 text-sm text-white/80">
                                                                    <ImageIcon className="h-4 w-4 text-[#01DE82]" />
                                                                    <span>
                                                                        {(participation.wasteImageUrls?.length || 0) +
                                                                            (participation.proofImageUrl ? 1 : 0) +
                                                                            (participation.afterImageUrl ? 1 : 0)} image(s)
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openReviewSheet(participation)}
                                                                className="text-[#01DE82] hover:bg-[#01DE82]/10 hover:text-[#01DE82]"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Review
                                                            </Button>

                                                            {!participation.isVerified && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleVerify(participation.id, true)}
                                                                        disabled={verifyMutation.isPending}
                                                                        className="bg-green-500 hover:bg-green-600 text-white"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handleVerify(participation.id, false)}
                                                                        disabled={verifyMutation.isPending}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Enhanced Review Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-4xl bg-[#020E0E] border-[#01DE82]/20 p-0 flex flex-col h-full"
                >
                    {selectedParticipation && (
                        <>
                            <SheetHeader className="px-8 py-6 border-b border-[#01DE82]/20 flex-shrink-0">
                                <SheetTitle className="text-2xl font-bold text-[#01DE82] flex items-center gap-3">
                                    <Award className="h-7 w-7" />
                                    Review Submission
                                </SheetTitle>
                                <SheetDescription className="text-white/60 text-base mt-2">
                                    Review and verify the waste collection submission from {selectedParticipation.user.firstName} {selectedParticipation.user.lastName}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 overflow-auto">
                                <div className="px-8 py-6 space-y-8">
                                    {/* User Info */}
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-6">
                                            <Avatar className="h-20 w-20 border-2 border-[#01DE82]/30">
                                                <AvatarImage src={selectedParticipation.user.picture || undefined} />
                                                <AvatarFallback className="bg-[#01DE82]/20 text-[#01DE82] font-bold text-xl">
                                                    {selectedParticipation.user.firstName[0]}{selectedParticipation.user.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-white mb-1">
                                                    {selectedParticipation.user.firstName} {selectedParticipation.user.lastName}
                                                </h3>
                                                <p className="text-white/60 mb-2">{selectedParticipation.user.email}</p>
                                                <p className="text-white/50 text-sm">
                                                    Submitted on {format(new Date(selectedParticipation.createdAt), "PPP 'at' p")}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={selectedParticipation.isVerified ? "default" : "secondary"}
                                                className={`text-sm px-3 py-1 ${selectedParticipation.isVerified
                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}
                                            >
                                                {selectedParticipation.isVerified ? "Verified" : "Pending Review"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-[#01DE82]/10 p-6 rounded-xl border border-[#01DE82]/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Weight className="h-6 w-6 text-[#01DE82]" />
                                                <Label className="text-white/80 font-medium text-base">Waste Collected</Label>
                                            </div>
                                            <p className="text-3xl font-bold text-[#01DE82]">{selectedParticipation.wasteCollectedKg} kg</p>
                                        </div>
                                        <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Star className="h-6 w-6 text-yellow-400" />
                                                <Label className="text-white/80 font-medium text-base">XP Earned</Label>
                                            </div>
                                            <p className="text-3xl font-bold text-yellow-400">{selectedParticipation.xpEarned} XP</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {selectedParticipation.wasteDescription && (
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <FileText className="h-6 w-6 text-[#01DE82]" />
                                                <Label className="text-white/80 font-medium text-base">Description</Label>
                                            </div>
                                            <p className="text-white leading-relaxed text-base">
                                                {selectedParticipation.wasteDescription}
                                            </p>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {selectedParticipation.collectionLocation && (
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <MapPin className="h-6 w-6 text-[#01DE82]" />
                                                <Label className="text-white/80 font-medium text-base">Collection Location</Label>
                                            </div>
                                            <p className="text-white text-base">{selectedParticipation.collectionLocation}</p>
                                        </div>
                                    )}

                                    {/* Images */}
                                    {(selectedParticipation.wasteImageUrls?.length > 0 || selectedParticipation.proofImageUrl || selectedParticipation.afterImageUrl) && (
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <ImageIcon className="h-6 w-6 text-[#01DE82]" />
                                                <Label className="text-white/80 font-medium text-base">Submission Images</Label>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedParticipation.wasteImageUrls?.map((url: string, index: number) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-video bg-black/20 rounded-lg overflow-hidden border border-[#01DE82]/20">
                                                            <img
                                                                src={url}
                                                                alt={`Waste collection ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <Eye className="h-8 w-8 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                                {selectedParticipation.proofImageUrl && (
                                                    <div className="relative group">
                                                        <div className="aspect-video bg-black/20 rounded-lg overflow-hidden border border-[#01DE82]/20">
                                                            <Image
                                                                height={250}
                                                                width={400}
                                                                src={selectedParticipation.proofImageUrl}
                                                                alt="Before cleanup"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <Eye className="h-8 w-8 text-white" />
                                                        </div>
                                                        <div className="absolute bottom-3 left-3 bg-[#01DE82] text-[#020E0E] px-3 py-1 rounded-md text-sm font-bold">
                                                            Before
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedParticipation.afterImageUrl && (
                                                    <div className="relative group">
                                                        <div className="aspect-video bg-black/20 rounded-lg overflow-hidden border border-[#01DE82]/20">
                                                            <Image
                                                                height={250}
                                                                width={400}
                                                                src={selectedParticipation.afterImageUrl}
                                                                alt="After cleanup"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <Eye className="h-8 w-8 text-white" />
                                                        </div>
                                                        <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                                                            After
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification Actions */}
                                    {!selectedParticipation.isVerified && (
                                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-6">
                                            <div>
                                                <Label htmlFor="bonusXP" className="text-white/80 font-medium text-base">Bonus XP Reward (0-100)</Label>
                                                <Input
                                                    id="bonusXP"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={bonusXP}
                                                    onChange={(e) => setBonusXP(parseInt(e.target.value) || 0)}
                                                    className="mt-3 bg-white/5 border-white/20 text-white focus:border-[#01DE82] focus:ring-[#01DE82] h-12 text-base"
                                                    placeholder="Enter bonus XP (optional)"
                                                />
                                                <p className="text-white/60 text-sm mt-3">
                                                    Award additional XP for exceptional submissions
                                                </p>
                                            </div>

                                            <div className="flex gap-4">
                                                <Button
                                                    onClick={() => handleVerify(selectedParticipation.id, true)}
                                                    disabled={verifyMutation.isPending}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12 text-base font-medium"
                                                >
                                                    <CheckCircle className="h-5 w-5 mr-2" />
                                                    Approve {bonusXP > 0 ? `& Award +${bonusXP} XP` : ''}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleVerify(selectedParticipation.id, false)}
                                                    disabled={verifyMutation.isPending}
                                                    className="flex-1 h-12 text-base font-medium"
                                                >
                                                    <XCircle className="h-5 w-5 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedParticipation.isVerified && (
                                        <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                                            <div className="flex items-center gap-3 text-green-400">
                                                <CheckCircle className="h-6 w-6" />
                                                <span className="font-medium text-base">This submission has been verified and approved</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
