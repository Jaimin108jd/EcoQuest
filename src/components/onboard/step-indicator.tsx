"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepIndicatorProps {
    steps: string[]
    currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                index < currentStep
                                    ? "bg-[#01DE82] text-black"
                                    : index === currentStep
                                        ? "bg-[#01DE82]/80 text-black"
                                        : "bg-white/10 text-white/60 border border-white/20"
                            )}
                        >
                            {index < currentStep ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span className="text-xs mt-2 text-center max-w-16 text-white/80">
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                "w-16 h-0.5 mx-2 transition-colors",
                                index < currentStep ? "bg-[#01DE82]" : "bg-white/20"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}