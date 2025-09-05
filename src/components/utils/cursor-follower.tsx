"use client"

import { useEffect, useRef } from "react"

export default function CursorFollower() {
    const cursorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const el = cursorRef.current
            if (!el) return
            requestAnimationFrame(() => {
                if (!cursorRef.current) return
                cursorRef.current.style.transform = `translate3d(${e.clientX - 100}px, ${e.clientY - 100}px, 0)`
            })
        }

        window.addEventListener("mousemove", handleMouseMove, { passive: true })
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div
            ref={cursorRef}
            className="fixed w-48 h-48 pointer-events-none z-[10000] will-change-transform"
            style={{
                left: 0,
                top: 0,
                transform: "translate3d(-100px, -100px, 0)",
                isolation: "isolate",
            }}
        >
            <div
                className="w-full h-full rounded-full blur-3xl opacity-20"
                style={{
                    background:
                        "radial-gradient(circle, rgba(1, 222, 130, 0.3) 0%, rgba(5, 97, 75, 0.15) 50%, transparent 70%)",
                    animation: "cursor-pulse 3s ease-in-out infinite",
                }}
            />
            <div
                className="absolute inset-8 rounded-full blur-2xl opacity-25"
                style={{
                    background:
                        "radial-gradient(circle, rgba(1, 222, 130, 0.4) 0%, transparent 60%)",
                    animation: "cursor-pulse 3s ease-in-out infinite 0.5s",
                }}
            />

            <style jsx>{`
        @keyframes cursor-pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
      `}</style>
        </div>
    )
}
