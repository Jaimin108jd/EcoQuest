"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"
import * as motion from "motion/react-client"

interface MobileLayoutProps {
    children: React.ReactNode
    userRole: "ORGANISER" | "NORMAL" | "ADMIN"
    userName: string
    ngoName?: string
}

export function MobileLayout({
    children,
    userRole,
    userName,
    ngoName
}: MobileLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="lg:hidden">
            {/* Mobile header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#020E0E]/90 backdrop-blur-xl border-b border-[#01DE82]/20 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-[#01DE82]">EcoQuest</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white/70 hover:text-white"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </header>

            {/* Mobile sidebar overlay */}
            {isMobileMenuOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className="fixed left-0 top-0 h-full w-[280px] z-50"
                    >
                        <Sidebar
                            userRole={userRole}
                            userName={userName}
                            ngoName={ngoName}
                            isCollapsed={false}
                            setIsCollapsed={() => setIsMobileMenuOpen(false)}
                        />
                    </motion.div>
                </>
            )}

            {/* Main content */}
            <main className="pt-20">
                {children}
            </main>
        </div>
    )
}
