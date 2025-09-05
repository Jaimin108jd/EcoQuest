import { OnboardingClient } from "@/components/onboard/onboarding-client"
import { OnboardingBackground } from "@/components/onboard/onboarding-background"

export default function OnboardingPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020E0E] text-white">
            <OnboardingBackground />
            <OnboardingClient />
        </div>
    )
}



