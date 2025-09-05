"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Calendar,
    BarChart3,
    Users,
    Settings,
    Home,
    LogOut,
    Menu,
    X,
    Plus,
    MapPin,
    Clock,
    Trophy,
    Award,
    Recycle,
    Target,
    Gift
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
    userRole: "ORGANISER" | "NORMAL" | "ADMIN"
    userName: string
    ngoName?: string
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

const organizerNavItems = [
    {
        label: "Dashboard",
        href: "/dash/org",
        icon: Home,
        description: "Overview & Impact Analytics"
    },
    {
        label: "Cleanup Events",
        href: "/dash/org/events",
        icon: Recycle,
        description: "Organize cleanup events"
    },
    {
        label: "Volunteers",
        href: "/dash/org/participants",
        icon: Users,
        description: "Manage volunteers"
    },
    {
        label: "Impact Analytics",
        href: "/dash/org/analytics",
        icon: BarChart3,
        description: "Environmental impact insights"
    },
    {
        label: "Settings",
        href: "/dash/org/settings",
        icon: Settings,
        description: "NGO & account settings"
    }
]

const userNavItems = [
    {
        label: "Dashboard",
        href: "/dash/usr",
        icon: Home,
        description: "Your impact & progress"
    },
    {
        label: "Discover Cleanups",
        href: "/dash/usr/events",
        icon: Recycle,
        description: "Find cleanup events nearby"
    },
    {
        label: "My Cleanups",
        href: "/dash/usr/my-events",
        icon: Clock,
        description: "Your registered cleanups"
    },
    {
        label: "Impact Tracker",
        href: "/dash/usr/history",
        icon: Target,
        description: "Your environmental impact"
    },
    {
        label: "Leaderboard",
        href: "/dash/usr/badges",
        icon: Trophy,
        description: "Rankings & achievements"
    },
    {
        label: "Settings",
        href: "/dash/usr/settings",
        icon: Settings,
        description: "Account & preferences"
    }
]

export function Sidebar({ userRole, userName, ngoName, isCollapsed, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname()

    const navItems = userRole === "ORGANISER" ? organizerNavItems : userNavItems

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-[#020E0E]/90 backdrop-blur-xl border-r border-[#01DE82]/20 z-50 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-[280px]'
                }`}
        >
            {/* Header */}
            <div className="p-4 border-b border-[#01DE82]/20">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex-1 transition-opacity duration-200">
                            <h1 className="text-xl font-bold text-[#01DE82]">
                                EcoQuest
                            </h1>
                            <p className="text-xs text-white/60">
                                {userRole === "ORGANISER" ? "Organizer Dashboard" : "User Dashboard"}
                            </p>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-white/70 hover:text-white hover:bg-[#01DE82]/10 transition-colors"
                    >
                        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-[#01DE82]/20">
                <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#01DE82] to-[#05614B] rounded-full flex items-center justify-center text-black font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {userName}
                            </p>
                            {ngoName && (
                                <p className="text-xs text-white/60 truncate">
                                    {ngoName}
                                </p>
                            )}
                            <Badge
                                variant="outline"
                                className="mt-1 text-xs border-[#01DE82]/30 text-[#01DE82]"
                            >
                                {userRole === "ORGANISER" ? "Organizer" : "Member"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={`
                  relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01]
                  ${isActive
                                        ? 'bg-[#01DE82]/10 text-[#01DE82] border border-[#01DE82]/30'
                                        : 'text-white/70 hover:text-white hover:bg-[#01DE82]/5'
                                    }
                `}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />

                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0 transition-opacity duration-200">
                                        <p className="font-medium truncate">{item.label}</p>
                                        <p className="text-xs opacity-60 truncate">{item.description}</p>
                                    </div>
                                )}

                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#01DE82] rounded-r-full" />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#01DE82]/20">
                <Button
                    variant="ghost"
                    className={`
            w-full text-white/70 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-colors
            ${isCollapsed ? 'px-0' : 'justify-start'}
          `}
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3">Sign Out</span>}
                </Button>
            </div>
        </aside>
    )
}