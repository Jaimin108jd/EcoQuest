import * as motion from "motion/react-client"

export function OnboardingBackground() {
    return (
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
            <motion.div
                className="absolute top-3/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-l from-[#05614B]/20 to-[#01DE82]/10 rounded-full blur-3xl"
                animate={{
                    x: [0, -60, 30, 0],
                    scale: [1, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#01DE82]/50 rounded-full"
                    style={{
                        left: `${25 + i * 25}%`,
                        top: `${35 + i * 15}%`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}
