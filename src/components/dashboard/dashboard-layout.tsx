"use client"

import { useState, createContext, useContext } from "react"
import { Sidebar } from "./sidebar"
import { DashboardBackground } from "./dashboard-background"
import { MobileLayout } from "./mobile-layout"

interface DashboardLayoutProps {
    children: React.ReactNode
    userRole: "ORGANISER" | "NORMAL" | "ADMIN"
    userName: string
    ngoName?: string
}

// Create context for sidebar state
const SidebarContext = createContext<{
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}>({
    isCollapsed: false,
    setIsCollapsed: () => { }
})

export const useSidebar = () => useContext(SidebarContext)

export function DashboardLayout({
    children,
    userRole,
    userName,
    ngoName
}: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <>
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <MobileLayout
                    userRole={userRole}
                    userName={userName}
                    ngoName={ngoName}
                >
                    <DashboardBackground>
                        {children}
                    </DashboardBackground>
                </MobileLayout>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
                <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
                    <DashboardBackground>
                        <div className="flex h-screen">
                            <Sidebar
                                userRole={userRole}
                                userName={userName}
                                ngoName={ngoName}
                                isCollapsed={isCollapsed}
                                setIsCollapsed={setIsCollapsed}
                            />

                            {/* Main content area with dynamic margin */}
                            <main
                                className="flex-1 relative transition-all duration-300 ease-in-out"
                                style={{
                                    marginLeft: isCollapsed ? '80px' : '280px'
                                }}
                            >
                                <div className="h-full overflow-auto">
                                    <div className="relative z-10">
                                        {children}
                                    </div>
                                </div>
                            </main>
                        </div>
                    </DashboardBackground>
                </SidebarContext.Provider>
            </div>
        </>
    )
}
