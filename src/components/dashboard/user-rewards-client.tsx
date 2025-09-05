"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    Gift,
    Coins,
    Star,
    Award,
    Leaf,
    ShoppingCart,
    Crown,
    Zap
} from "lucide-react"
import { toast } from "sonner"

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
    userXP?: {
        totalXP: number
        currentLevel: number
    } | null
}

interface UserRewardsClientProps {
    user: User
}

const rewards = [
    {
        id: 1,
        name: "Eco Water Bottle",
        description: "Sustainable steel water bottle",
        xpCost: 500,
        category: "Physical",
        icon: "🌊",
        inStock: true
    },
    {
        id: 2,
        name: "Plant a Tree Certificate",
        description: "Certificate for planting one tree",
        xpCost: 300,
        category: "Impact",
        icon: "🌳",
        inStock: true
    },
    {
        id: 3,
        name: "Eco-Friendly Tote Bag",
        description: "Reusable cotton tote bag",
        xpCost: 200,
        category: "Physical",
        icon: "👜",
        inStock: true
    },
    {
        id: 4,
        name: "Amazon Gift Card ₹500",
        description: "Digital gift card worth ₹500",
        xpCost: 1000,
        category: "Digital",
        icon: "🎁",
        inStock: true
    },
    {
        id: 5,
        name: "CleanQuest Premium Badge",
        description: "Exclusive premium member badge",
        xpCost: 750,
        category: "Badge",
        icon: "👑",
        inStock: true
    },
    {
        id: 6,
        name: "Local NGO Donation",
        description: "₹100 donation to local environmental NGO",
        xpCost: 400,
        category: "Impact",
        icon: "💚",
        inStock: true
    }
]

export function UserRewardsClient({ user }: UserRewardsClientProps) {
    const [activeTab, setActiveTab] = useState("all")
    const [redeeming, setRedeeming] = useState<number | null>(null)

    const userXP = user.userXP?.totalXP || 0
    const userLevel = user.userXP?.currentLevel || 1

    const handleRedeem = async (rewardId: number, xpCost: number) => {
        if (userXP < xpCost) {
            toast.error("Not enough XP to redeem this reward!")
            return
        }

        setRedeeming(rewardId)
        
        // Simulate API call
        setTimeout(() => {
            toast.success("Reward redeemed successfully! Check your email for details.")
            setRedeeming(null)
        }, 2000)
    }

    const filteredRewards = rewards.filter(reward => {
        if (activeTab === "all") return true
        return reward.category.toLowerCase() === activeTab
    })

    const getXPProgress = () => {
        const currentLevelXP = (userLevel - 1) * 100
        const nextLevelXP = userLevel * 100
        const progress = ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
        return Math.min(progress, 100)
    }

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Rewards Store
                    </h1>
                    <p className="text-white/70 mt-1">
                        Redeem your XP for amazing eco-friendly rewards!
                    </p>
                </div>
            </div>

            {/* XP Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Coins className="h-6 w-6 text-[#01DE82]" />
                            <div>
                                <p className="text-white/70 text-sm">Available XP</p>
                                <p className="text-white text-2xl font-bold">{userXP.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Crown className="h-6 w-6 text-yellow-400" />
                            <div>
                                <p className="text-white/70 text-sm">Current Level</p>
                                <p className="text-white text-2xl font-bold">{userLevel}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-white/70 text-sm">Level Progress</span>
                                <span className="text-white text-sm">{getXPProgress().toFixed(0)}%</span>
                            </div>
                            <Progress value={getXPProgress()} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rewards Tabs */}
            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                <CardHeader>
                    <CardTitle className="text-white text-xl">Available Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-[#020E0E]/40 border border-[#01DE82]/20">
                            <TabsTrigger 
                                value="all"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white/70"
                            >
                                All
                            </TabsTrigger>
                            <TabsTrigger 
                                value="physical"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white/70"
                            >
                                Physical
                            </TabsTrigger>
                            <TabsTrigger 
                                value="digital"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white/70"
                            >
                                Digital
                            </TabsTrigger>
                            <TabsTrigger 
                                value="impact"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white/70"
                            >
                                Impact
                            </TabsTrigger>
                            <TabsTrigger 
                                value="badge"
                                className="data-[state=active]:bg-[#01DE82]/20 data-[state=active]:text-[#01DE82] text-white/70"
                            >
                                Badges
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRewards.map((reward) => (
                                    <Card 
                                        key={reward.id}
                                        className="bg-[#020E0E]/40 backdrop-blur-xl border-[#01DE82]/20 hover:border-[#01DE82]/40 transition-all duration-300"
                                    >
                                        <CardContent className="p-6">
                                            <div className="text-center space-y-4">
                                                <div className="text-4xl">{reward.icon}</div>
                                                <div>
                                                    <h3 className="text-white font-semibold text-lg">{reward.name}</h3>
                                                    <p className="text-white/70 text-sm mt-1">{reward.description}</p>
                                                </div>
                                                
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Coins className="h-4 w-4 text-[#01DE82]" />
                                                    <span className="text-[#01DE82] font-bold">{reward.xpCost} XP</span>
                                                </div>

                                                <Badge 
                                                    className={`${
                                                        reward.category === 'Physical' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                        reward.category === 'Digital' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                        reward.category === 'Impact' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                    }`}
                                                >
                                                    {reward.category}
                                                </Badge>

                                                <Button
                                                    onClick={() => handleRedeem(reward.id, reward.xpCost)}
                                                    disabled={userXP < reward.xpCost || redeeming === reward.id}
                                                    className={`w-full ${
                                                        userXP >= reward.xpCost 
                                                            ? 'bg-[#01DE82]/20 border border-[#01DE82]/40 text-[#01DE82] hover:bg-[#01DE82]/30 hover:border-[#01DE82]/60' 
                                                            : 'bg-gray-600/20 border border-gray-600/40 text-gray-400 cursor-not-allowed'
                                                    } transition-all duration-300`}
                                                >
                                                    {redeeming === reward.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            <span>Redeeming...</span>
                                                        </div>
                                                    ) : userXP >= reward.xpCost ? (
                                                        <div className="flex items-center space-x-2">
                                                            <ShoppingCart className="h-4 w-4" />
                                                            <span>Redeem</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <Zap className="h-4 w-4" />
                                                            <span>Need {(reward.xpCost - userXP).toLocaleString()} more XP</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Earning XP Tips */}
            <Card className="bg-[#020E0E]/60 backdrop-blur-xl border-[#01DE82]/20">
                <CardHeader>
                    <CardTitle className="text-white text-xl flex items-center space-x-2">
                        <Leaf className="h-5 w-5 text-[#01DE82]" />
                        <span>How to Earn More XP</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#01DE82]/20 flex items-center justify-center">
                                    <span className="text-[#01DE82] text-sm font-bold">+10</span>
                                </div>
                                <span className="text-white/90">Register for a cleanup event</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#01DE82]/20 flex items-center justify-center">
                                    <span className="text-[#01DE82] text-sm font-bold">+50</span>
                                </div>
                                <span className="text-white/90">Check-in at event location</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#01DE82]/20 flex items-center justify-center">
                                    <span className="text-[#01DE82] text-sm font-bold">+100</span>
                                </div>
                                <span className="text-white/90">Upload proof of waste collection</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#01DE82]/20 flex items-center justify-center">
                                    <span className="text-[#01DE82] text-sm font-bold">+5</span>
                                </div>
                                <span className="text-white/90">Per kg of waste collected</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#01DE82]/20 flex items-center justify-center">
                                    <span className="text-[#01DE82] text-sm font-bold">+25</span>
                                </div>
                                <span className="text-white/90">Daily streak bonus</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#01DE82]/20 flex items-center justify-center">
                                    <span className="text-[#01DE82] text-sm font-bold">+200</span>
                                </div>
                                <span className="text-white/90">Complete special challenges</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
