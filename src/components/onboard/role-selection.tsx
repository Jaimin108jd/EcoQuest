"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building } from "lucide-react"

interface RoleSelectionProps {
    onNext: (role: "NORMAL" | "ORGANISER") => void
}

export function RoleSelection({ onNext }: RoleSelectionProps) {
    const [selectedRole, setSelectedRole] = useState<"NORMAL" | "ORGANISER" | null>(null)

    const roles = [
        {
            id: "NORMAL" as const,
            title: "User",
            description: "Join environmental initiatives and track your impact",
            icon: Users,
            features: ["Participate in eco-quests", "Track environmental impact", "Connect with community"]
        },
        {
            id: "ORGANISER" as const,
            title: "Organizer",
            description: "Create and manage environmental campaigns",
            icon: Building,
            features: ["Create eco-quests", "Manage NGO profile", "Lead community initiatives"]
        }
    ]

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Role</h2>
                <p className="text-white/80">How would you like to contribute to environmental change?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {roles.map((role) => {
                    const Icon = role.icon
                    return (
                        <Card
                            key={role.id}
                            className={`cursor-pointer transition-all hover:scale-105 bg-[#01DE82]/[0.03] backdrop-blur-3xl border ${selectedRole === role.id
                                ? "ring-2 ring-[#01DE82] border-[#01DE82]"
                                : "border-[#01DE82]/20 hover:border-[#01DE82]/40"
                                }`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <CardHeader className="text-center">
                                <div className="mx-auto w-12 h-12 bg-[#01DE82]/20 rounded-full flex items-center justify-center mb-3">
                                    <Icon className="w-6 h-6 text-[#01DE82]" />
                                </div>
                                <CardTitle className="text-xl text-white">{role.title}</CardTitle>
                                <CardDescription className="text-white/70">{role.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {role.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-white/80">
                                            <div className="w-1.5 h-1.5 bg-[#01DE82] rounded-full mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={() => selectedRole && onNext(selectedRole)}
                    disabled={!selectedRole}
                    size="lg"
                    className="px-8 bg-[#01DE82] hover:bg-[#01DE82]/90 text-black"
                >
                    Continue
                </Button>
            </div>
        </div>
    )
}
