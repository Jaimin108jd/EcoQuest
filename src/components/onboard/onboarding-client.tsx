"use client"

import { useState } from "react"
import * as motion from "motion/react-client"
import { StepIndicator } from "@/components/onboard/step-indicator"
import { RoleSelection } from "@/components/onboard/role-selection"
import { UserDetails } from "@/components/onboard/user-details"
import { OrganizerDetails } from "@/components/onboard/organizer-details"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"

const steps = ["Role", "Details", "Complete"]

interface OnboardingData {
    role: "NORMAL" | "ORGANISER"
    contactNo: string
    location: { latitude: number; longitude: number; locationName: string }
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"
    age?: number
    ngo?: {
        name: string
        contactNo: string
        location: { latitude: number; longitude: number; locationName: string }
        organizationSize: number
        establishmentYear: number
    }
}

interface OnboardingClientProps {
    initialStep?: number
}

export function OnboardingClient({ initialStep = 0 }: OnboardingClientProps) {
    const [currentStep, setCurrentStep] = useState(initialStep)
    const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})
    const [isCompleted, setIsCompleted] = useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const completeOnboardingMutation = useMutation({
        ...trpc.user.completeOnboarding.mutationOptions(),
        onSuccess: () => {
            setIsCompleted(true)
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
        onError: (error) => {
            console.error("Onboarding error:", error)
        }
    })

    const handleRoleSelection = (role: "NORMAL" | "ORGANISER") => {
        setOnboardingData(prev => ({ ...prev, role }))
        setCurrentStep(1)
    }

    const handleUserDetails = (data: {
        contactNo: string
        location: { latitude: number; longitude: number; locationName: string }
        gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"
        age: number
    }) => {
        const updatedData = { ...onboardingData, ...data }
        setOnboardingData(updatedData)
        completeOnboardingMutation.mutate(updatedData as OnboardingData)
    }

    const handleOrganizerDetails = (data: {
        contactNo: string
        location: { latitude: number; longitude: number; locationName: string }
        ngo: {
            name: string
            contactNo: string
            location: { latitude: number; longitude: number; locationName: string }
            organizationSize: number
            establishmentYear: number
        }
    }) => {
        const updatedData = { ...onboardingData, ...data }
        setOnboardingData(updatedData)
        completeOnboardingMutation.mutate(updatedData as OnboardingData)
    }

    const handleBackToRole = () => {
        setCurrentStep(0)
    }

    const handleGoToDashboard = () => {
        // based on the user role push it to their dashboard.
        onboardingData.role === "ORGANISER" ? router.push('/dash/org') : router.push('/dash/usr');
        // router.push('/dashboard')
    }

    if (isCompleted) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-[#020E0E] flex items-center justify-center p-4">
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-[#05614B]/20 to-[#020E0E]" />
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-[#01DE82]/20 to-[#05614B]/15 rounded-full blur-3xl"
                        animate={{
                            x: [0, 50, -25, 0],
                            scale: [1, 1.2, 0.9, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="max-w-md mx-auto text-center bg-[#01DE82]/[0.03] backdrop-blur-3xl border border-[#01DE82]/20">
                        <CardContent className="pt-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <CheckCircle className="w-16 h-16 text-[#01DE82] mx-auto mb-4" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome to EcoQuest!</h2>
                            <p className="text-white/80 mb-6">
                                Your onboarding is complete. Ready to make a difference?
                            </p>
                            <Button onClick={handleGoToDashboard} size="lg" className="w-full bg-[#01DE82] hover:bg-[#01DE82]/90 text-black">
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <motion.h1
                            className="text-3xl font-bold text-white mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Welcome to <span className="text-[#01DE82]">EcoQuest</span>
                        </motion.h1>
                        <motion.p
                            className="text-white/80"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Let's set up your profile to get started
                        </motion.p>
                    </div>

                    <StepIndicator steps={steps} currentStep={currentStep} />

                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 0 && (
                            <RoleSelection onNext={handleRoleSelection} />
                        )}

                        {currentStep === 1 && onboardingData.role === "NORMAL" && (
                            <UserDetails
                                onNext={handleUserDetails}
                                onBack={handleBackToRole}
                            />
                        )}

                        {currentStep === 1 && onboardingData.role === "ORGANISER" && (
                            <OrganizerDetails
                                onNext={handleOrganizerDetails}
                                onBack={handleBackToRole}
                            />
                        )}
                    </motion.div>

                    {completeOnboardingMutation.isPending && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        >
                            <Card className="p-6 text-center bg-[#01DE82]/[0.03] backdrop-blur-3xl border border-[#01DE82]/20">
                                <div className="animate-spin w-8 h-8 border-2 border-[#01DE82] border-t-transparent rounded-full mx-auto mb-4" />
                                <p className="text-white/80">Setting up your profile...</p>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </>
    )
}
