interface DashboardBackgroundProps {
    children: React.ReactNode
}

export function DashboardBackground({ children }: DashboardBackgroundProps) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#020E0E]">
            {/* Optimized background matching home page */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#020E0E] via-[#05614B]/20 to-[#020E0E]" />

                {/* Static primary orb with subtle opacity animation */}
                <div
                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-[#01DE82]/20 to-[#05614B]/15 rounded-full blur-3xl animate-pulse"
                    style={{ animationDuration: '4s' }}
                />

                {/* Static secondary orb with delayed pulse */}
                <div
                    className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-[#05614B]/20 to-[#01DE82]/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDuration: '6s', animationDelay: '2s' }}
                />

                {/* Static tertiary orb */}
                <div className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-gradient-to-tr from-[#01DE82]/15 to-[#05614B]/8 rounded-full blur-2xl opacity-80" />

                {/* Simplified static grid pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="h-full w-full"
                        style={{
                            backgroundImage: `
                radial-gradient(circle at 25% 25%, #01DE82 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, #05614B 1px, transparent 1px)
              `,
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>
            </div>

            {children}
        </div>
    )
}
